<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Models\Author;

class AuthorController
{
    /**
     * Display a listing of the resource.
     */

    public function indexPaginated(){
        // Fetch all authors with pagination
        $authors = Author::paginate(15);
        return response()->json($authors);
    }
    public function index()
    {
        // if there is a query parameter 'search', filter authors by name
        if (request()->has('search') && request()->input('search') !== '') {
            $search = request()->input('search');
            $authors = Author::where('name', 'like', '%' . $search . '%')->get();
            return response()->json([
                'data' => $authors,
                'success' => true,
            ]);
        }
        // Otherwise, return all authors
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
        // Validate the request
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Find the author by ID
        $author = Author::findOrFail($id);

        // Update the author's name
        $author->update([
            'name' => $request->name,
        ]);

        return response()->json($author);
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
