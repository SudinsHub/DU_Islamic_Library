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

        $halls = \App\Models\Hall::all();
        return response()->json($halls);
    }
    public function indexPaginated()
    {

        $halls = \App\Models\Hall::paginate(15);
        return response()->json($halls);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            // gender: required, male or female
            'gender' => 'required'
        ]);
        $hall = \App\Models\Hall::create([
            'name' => $request->name,
            'gender' => $request->gender,
        ]);
        return response()->json($hall, 201);

    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $hall = \App\Models\Hall::findOrFail($id);
        return response()->json($hall);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'gender' => 'required|in:male,female',
        ]);
        $hall = \App\Models\Hall::findOrFail($id);
        $hall->update([
            'name' => $request->name,
            'gender' => $request->gender,
        ]);
        return response()->json($hall);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $hall = \App\Models\Hall::findOrFail($id);
        $hall->delete();
        return response()->json(null, 204);
    }
}
