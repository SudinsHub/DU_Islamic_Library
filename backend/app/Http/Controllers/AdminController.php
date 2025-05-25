<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\StoreAdminRequest;
use App\Http\Requests\UpdateAdminRequest;

class AdminController extends Controller
{
    /** Admin Register */
    public function register(Request $request)
    {
        $admin= Admin::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => $request->input('password'),
        ]);

        $token = $admin->createToken('admin-token', ['actAsAdmin'])->plainTextToken;

        return response()->json(['token' => $token, 'admin' => $admin], 201);
    }

    /** Admin Login */
    public function login(Request $request)
    {
        $admin = Admin::where('email', $request->input->input('email'))->first();

        if (!$admin || !Hash::check($request->input('password'), $admin->password)) {
            return response()->json(['message' => 'Email or password incorrect'], 401);
        }
        $token = $admin->createToken('admin-token', ['actAsAdmin'])->plainTextToken;
        return response()->json(['token' => $token, 'admin' => $admin], 200);
    }

    /** Admin Logout*/
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
    public function store(StoreAdminRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Admin $admin)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAdminRequest $request, Admin $admin)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Admin $admin)
    {
        //
    }
}
