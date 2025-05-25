<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CategoryController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //    CATEGORY {
        // string category_id PK
        // string name } 
        // Fetch all categories' name 

        $categories = \App\Models\Category::all();
        return response()->json($categories);
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

        // Create a new category
        $category = \App\Models\Category::create([
            'name' => $request->name,
        ]);

        return response()->json($category, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Fetch category by ID
        $category = \App\Models\Category::findOrFail($id);
        return response()->json($category);
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
        // Fetch category by ID
        $category = \App\Models\Category::findOrFail($id);
        
        // Delete the category
        $category->delete();

        return response()->json(null, 204);
    }
}
