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
    /** Volunteer Register */
    public function register(Request $request)
    {
        $volunteer= Volunteer::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => $request->input('password'),
        ]);

        $token = $volunteer->createToken('volunteer-token', ['actAsVolunteer'])->plainTextToken;

        return response()->json(['token' => $token, 'volunteer' => $volunteer], 201);
    }

    /** Volunteer Login */
    public function login(Request $request)
    {
        $volunteer = Volunteer::where('email', $request->input->input('email'))->first();

        if (!$volunteer || !Hash::check($request->input('password'), $volunteer->password)) {
            return response()->json(['message' => 'Email or password incorrect'], 401);
        }
        $token = $volunteer->createToken('volunteer-token', ['actAsVolunteer'])->plainTextToken;
        return response()->json(['token' => $token, 'volunteer' => $volunteer], 200);
    }

    /** Volunteer Logout*/
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully'], 200);
    }

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
    public function destroy(Volunteer $volunteer)
    {
        //
    }

    public function toggleAvailability(Request $request)
    {
        $volunteer = $request->user();

        // Toggle the availability status
        $volunteer->isAvailable = !$volunteer->isAvailable;
        $volunteer->save();

        return response()->json(['message' => 'Availability status updated successfully', 'isAvailable' => $volunteer->isAvailable], 200);
    }
}
