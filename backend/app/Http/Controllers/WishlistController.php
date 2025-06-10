<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Logic to retrieve and return the wishlist items for the authenticated user
        // $user = $request->user();
        // $wishlistItems = $user->wishlist()->with(['book', 'book.author'])->get();
        $wishlistItems = $request->user()->wishlist()
            ->with(['book', 'book.author'])
            ->get()
            ->map(function ($item) {
                return [
                    'wish_id' => $item->wish_id,
                    'book_id' => $item->book_id,
                    'title' => $item->book->title,
                    'author' => $item->book->author->name,
                    'image_url' => $item->book->image_url,
                ];
            });


        // $wishlistItems = Wishlist::where('reader_id', $request->user()->reader_id)
        //     ->with(['book', 'book.author'])
        //     ->get();    
        //     // ->map(function ($item) {
        //     //     return [
        //     //         'wish_id' => $item->wish_id,
        //     //         'book_id' => $item->book_id,
        //     //         'title' => $item->book->title,
        //     //         'author' => $item->book->author ? $item->book->author->name : null,
        //     //         'image_url' => $item->book->image_url,
        //     //     ];
        //     // });
        return response()->json($wishlistItems);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // check whether entry wth book_id already exists in wishlist
        $existingItem = $request->user()->wishlist()->where('book_id', $request->input('book_id'))->first();
        if ($existingItem) {
            return response()->json(['message' => 'Book already in wishlist'], 409);
        }

        $request->validate([
            'book_id' => 'required|exists:books,book_id',
        ]);

        $user = $request->user();
        $user->wishlist()->create(['book_id' => $request->input('book_id')]);

        return response()->json(['message' => 'Book added to wishlist'], 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, $id)
    {
        // Logic to remove a book from the user's wishlist
        $user = $request->user();
        $wishlistItem = $user->wishlist()->where('book_id', $id)->first();

        if ($wishlistItem) {
            $wishlistItem->delete();
            return response()->json(['message' => 'Book removed from wishlist'], 200);
        }

        return response()->json(['message' => 'Book not found in wishlist'], 404);
    }
}
