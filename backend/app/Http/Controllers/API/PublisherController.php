<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Models\Publisher;

class PublisherController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $publishers = Publisher::all("name");
        return response()->json($publishers);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate the request
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Create a new publisher
        $publisher = Publisher::create([
            'name' => $request->name,
        ]);

        return response()->json($publisher, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Fetch publisher by ID
        $publisher = Publisher::findOrFail($id);
        return response()->json($publisher);
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
        // Find the publisher by ID
        $publisher = Publisher::findOrFail($id);

        // Delete the publisher
        $publisher->delete();

        return response()->json(['message' => 'Publisher deleted successfully.'], 200);
    }
}
