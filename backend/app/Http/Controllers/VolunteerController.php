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
    public function index()
    {
        //
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
}
