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
        // If there is a query parameter 'search', filter publishers by name
        if (request()->has('search') && request()->input('search') !== '') {
            $search = request()->input('search');
            $publishers = Publisher::where('name', 'like', '%' . $search . '%')->get();
            return response()->json([
                'success' => true,
                'data' => $publishers,
            ]);
        }
        // Otherwise, return all publishers
        $publishers = Publisher::all();
        return response()->json($publishers);
    }

    public function indexPaginated()
    {
        // Fetch all publishers with pagination
        $publishers = Publisher::paginate(15);
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
        // Validate the request
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Find the publisher by ID
        $publisher = Publisher::findOrFail($id);

        // Update the publisher
        $publisher->update([
            'name' => $request->name,
        ]);

        return response()->json($publisher);
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
