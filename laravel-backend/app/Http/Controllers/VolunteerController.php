<?php

namespace App\Http\Controllers;

use App\Models\Volunteer;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\StoreVolunteerRequest;
use App\Http\Requests\UpdateVolunteerRequest;

class VolunteerController extends Controller
{

    /**
     * Display a listing of the resource.
     */
    public function getAvailableVols(Request $request)
    {
        // fetch all volunteers with hall_id == $request->hall_id and who's isAvailable is true
        $hallId = $request->input('hall_id'); 
    
        if (!$hallId) {
            return response()->json(['message' => 'Hall ID is required'], 400);
        }
    
        $volunteers = Volunteer::where('hall_id', $hallId)
            ->where('isAvailable', true)
            ->get();
    
        if ($volunteers->isEmpty()) { // 'message' => 'No available volunteers found for this hall'
            return response()->json([], 200);
        }
        
        // send name, email, contact, address, room_no only
        $volunteers = $volunteers->map(function ($volunteer) {
            return [
                'name' => $volunteer->name,
                'email' => $volunteer->email,
                'contact' => $volunteer->contact,
                'address' => $volunteer->address,
                'room_no' => $volunteer->room_no,
            ];
        });

        // Return the list of available volunteers
        return response()->json($volunteers, 200);
    }
    /**
     * Display a listing of the volunteers with pagination.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10); // Default 10 items per page

        $query = Volunteer::with(['hall', 'department']);

        // Filter by name
        if ($request->has('name') && $request->input('name') !== '') {
            $query->where('name', 'like', '%' . $request->input('name') . '%');
        }

        // Filter by hall_id
        if ($request->has('hall_id') && $request->input('hall_id') !== '') {
            $query->where('hall_id', $request->input('hall_id'));
        }

        // Filter by isVerified
        if ($request->has('isVerified') && $request->boolean('isVerified')) {
            $query->where('isVerified', true);
        }

        // Filter by isAvailable
        if ($request->has('isAvailable') && $request->boolean('isAvailable')) {
            $query->where('isAvailable', true);
        }

        $volunteers = $query->paginate($perPage);

        return response()->json($volunteers);
    }

    /**
     * Update the specified volunteer in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Volunteer  $volunteer
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Volunteer $volunteer)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'registration_no' => 'nullable|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('volunteers')->ignore($volunteer->volunteer_id, 'volunteer_id'),
            ],
            'contact' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'hall_id' => 'required|uuid|exists:halls,hall_id',
            'dept_id' => 'required|uuid|exists:departments,dept_id',
            'session' => 'nullable|string|max:255',
            'isAvailable' => 'boolean',
            'isVerified' => 'boolean',
            'room_no' => 'nullable|integer',

        ]);


        $volunteer->update($validatedData);

        return response()->json([
            'message' => 'Volunteer updated successfully!',
            'volunteer' => $volunteer->load(['hall', 'department'])
        ]);
    }

    /**
     * Remove the specified volunteer from storage.
     *
     * @param  \App\Models\Volunteer  $volunteer
     * @return \Illuminate\Http\Response
     */
    public function destroy(Volunteer $volunteer)
    {
        $volunteer->delete();

        return response()->json(['message' => 'Volunteer deleted successfully!']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function deleteVolunteer(Request $request)
    {
        $volunteer_id = $request->input('volunteer_id');
        // Find the volunteer by ID
        $volunteer = Volunteer::find($volunteer_id);

        // If the authenticated user is not a volunteer, return an error
        if (!$volunteer_id) {
            return response()->json(['message' => 'Volunteer ID required'], 401);
        }

        // Check if the volunteer exists
        if (!$volunteer) {
            return response()->json(['message' => 'Volunteer not found'], 404);
        }

        // Delete the volunteer
        $volunteer->delete();

        return response()->json(['message' => 'Volunteer deleted successfully'], 200);
    }

    public function toggleAvailability(Request $request)
    {
        $volunteer = $request->user();

        // Toggle the availability status
        $volunteer->isAvailable = !$volunteer->isAvailable;
        $volunteer->save();

        return response()->json(['message' => 'Availability status updated successfully', 'isAvailable' => $volunteer->isAvailable], 200);
    }

    public function getUnverifiedVolunteers(Request $request)
    {
        try {
                    // Fetch all volunteers who are not verified
        $unverifiedVolunteers = Volunteer::where('isVerified', false)
        ->with(['hall', 'department']) // Eager load hall and department relationships
        ->select('volunteer_id', 'name', 'registration_no',  'email', 'contact', 'address', 'room_no', 'hall_id', 'dept_id', 'isVerified') 
        ->get();

        return response()->json([
            'message' => 'Unverified volunteers retrieved successfully',
            'unverifiedVolunteers' => $unverifiedVolunteers
        ], 200);
        } catch (\Exception $e) {
            // Handle any errors that may occur
            return response()->json(['message' => 'Error fetching unverified volunteers: ' . $e->getMessage()], 500);
            
        }

    }

    public function verifyVolunteer(Request $request)
    {
        // Find the volunteer by ID

        
        $volunteer = Volunteer::find($request->input('volunteer_id'));

        if (!$volunteer) {
            return response()->json(['message' => 'Volunteer not found'], 404);
        }

        // Update the isVerified status
        $volunteer->isVerified = true;
        $volunteer->save();

        return response()->json(['message' => 'Volunteer verified successfully'], 200);
    }
}
