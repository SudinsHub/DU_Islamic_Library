<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Models\Author;

class AuthorController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //    AUTHOR {
        // string author_id PK
        // string name } 
        // Fetch all authors' name 

        $authors = Author::all();
        return response()->json($authors);
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

        // Create a new author
        $author = Author::create([
            'name' => $request->name,
        ]);

        return response()->json($author, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Fetch author by ID
        $author = Author::findOrFail($id);
        return response()->json($author);
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
        // Find the author by ID
        $author = Author::findOrFail($id);

        // Delete the author
        $author->delete();

        return response()->json([
            'message' => 'Author deleted successfully',
        ]);
    }
}
