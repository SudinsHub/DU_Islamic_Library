<?php

namespace App\Http\Controllers;

use App\Models\Reader;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\StoreReaderRequest;
use App\Http\Requests\UpdateReaderRequest;

class ReaderController extends Controller
{
    /** Reader Register */
    public function register(Request $request)
        {
            $reader = Reader::create([
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'password' => $request->input('password'),
            ]);

            $token = $reader->createToken('reader-token', ['actAsReader'])->plainTextToken;

            return response()->json(['token' => $token, 'reader' => $reader], 201);
        }

    /** Reader Login */
    public function login(Request $request)
        {
            $reader= Reader::where('email', $request->input->input('email'))->first();

            if (!$reader|| !Hash::check($request->input('password'), $reader->password)) {
                return response()->json(['message' => 'Email or password incorrect'], 401);
            }
            $token = $reader->createToken('reader-token', ['actAsReader'])->plainTextToken;
            return response()->json(['token' => $token, 'reader' => $reader], 200);
        }

    /** Reader Logout*/
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
    public function store(StoreReaderRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Reader $reader)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateReaderRequest $request, Reader $reader)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Reader $reader)
    {
        //
    }
}
