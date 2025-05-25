<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HallController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //    HALL {
        // string hall_id PK
        // string name } 
        // Fetch all halls' name 
        // Gender DUE
        $halls = \App\Models\Hall::all();
        return response()->json($halls);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
