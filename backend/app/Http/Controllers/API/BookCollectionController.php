<?php

namespace App\Http\Controllers\API;

use App\Models\Book;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\BookCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class BookCollectionController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        
    }

/**
     * Store or update a book collection entry.
     *
     * @param  \App\Http\Requests\StoreBookCollectionRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Search for books by title.
     * Updated to include image_url and foreign key IDs for frontend auto-fill.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        $request->validate(['title' => 'required|string|min:3']);

        $title = $request->query('title');

        $books = Book::where('title', 'LIKE', '%' . $title . '%')
                     ->select('book_id', 'title', 'description', 'image_url',
                              'author_id', 'publisher_id', 'category_id')
                     // Eager load relationships to get names for display in suggestions
                     ->with(['author:author_id,name', 'publisher:publisher_id,name', 'category:category_id,name'])
                     ->limit(10)
                     ->get();

        return response()->json([
            'success' => true,
            'data' => $books->map(function($book) {
                return [
                    'book_id' => $book->book_id,
                    'title' => $book->title,
                    'author_id' => $book->author_id,
                    'publisher_id' => $book->publisher_id,
                    'category_id' => $book->category_id,
                    'description' => $book->description,
                    // Construct full public URL for the image
                    'image_url' => $book->image_url ? Storage::url($book->image_url) : null,
                    // Include names for frontend display in suggestions
                    'author_name' => $book->author->name ?? null,
                    'publisher_name' => $book->publisher->name ?? null,
                    'category_name' => $book->category->name ?? null,
                ];
            })
        ]);
    }

    // You might also have an update method for modifying copies directly
    public function update(Request $request, BookCollection $bookCollection)
    {
        $request->validate([
            'total_copies' => 'sometimes|required|integer|min:0',
            'available_copies' => 'sometimes|required|integer|min:0|lte:total_copies',
        ]);
        $bookCollection->update($request->validated());
        return response()->json(['message' => 'Book collection updated successfully!', 'data' => $bookCollection]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $bookCollection = BookCollection::findOrFail($id);
        return response()->json($bookCollection);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $bookCollection = BookCollection::findOrFail($id);
        $bookCollection->delete();
        return response()->json([
            'message' => 'Book collection deleted successfully.',
        ], 200);
    }
}
