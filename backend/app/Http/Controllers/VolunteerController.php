<?php

namespace App\Http\Controllers;

use App\Models\Volunteer;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\StoreVolunteerRequest;
use App\Http\Requests\UpdateVolunteerRequest;

class VolunteerController extends Controller
{

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
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
     * Store a newly created resource in storage.
     */
    public function store(StoreVolunteerRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Volunteer $volunteer)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateVolunteerRequest $request, Volunteer $volunteer)
    {
        //
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
