<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Models\BookCollection;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreBookCollectionRequest;

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
    public function store(StoreBookCollectionRequest $request)
    {
        $bookId = $request->input('book_id');
        $hallId = $request->input('hall_id');
        $newTotalCopies = $request->input('total_copies');
        $newAvailableCopies = $request->input('available_copies');

        // Use a database transaction to ensure atomicity
        return DB::transaction(function () use ($bookId, $hallId, $newTotalCopies, $newAvailableCopies) {
            // Find an existing collection entry or create a new instance
            $bookCollection = BookCollection::firstOrNew(
                ['book_id' => $bookId, 'hall_id' => $hallId]
            );

            $isNew = !$bookCollection->exists; // Check if it's a new record

            if ($isNew) {
                // If it's a new record, simply assign the values
                $bookCollection->collection_id = (string) \Illuminate\Support\Str::uuid(); // Manually set UUID for new record
                $bookCollection->total_copies = $newTotalCopies;
                $bookCollection->available_copies = $newAvailableCopies;
            } else {
                // If it's an existing record, update the counts cumulatively
                $bookCollection->total_copies += $newTotalCopies;
                $bookCollection->available_copies += $newAvailableCopies;

                // Ensure available copies don't exceed total copies (important for updates)
                if ($bookCollection->available_copies > $bookCollection->total_copies) {
                    $bookCollection->available_copies = $bookCollection->total_copies;
                }
            }

            // Perform final validation on combined counts before saving
            // This catches cases where current_available + new_available > current_total + new_total
            if ($bookCollection->available_copies < 0) { // Should ideally be caught by min:0, but defensive
                return response()->json(['message' => 'Calculated available copies cannot be negative.'], 422);
            }
            if ($bookCollection->available_copies > $bookCollection->total_copies) {
                 // This should be caught by the above logic, but as a final check
                return response()->json(['message' => 'Final available copies cannot exceed total copies.'], 422);
            }


            $bookCollection->save(); // Save the new or updated record

            $status = $isNew ? 201 : 200; // 201 Created, 200 OK (for update)
            $message = $isNew ? 'Book collection added successfully!' : 'Book collection updated successfully!';

            return response()->json([
                'message' => $message,
                'data' => $bookCollection
            ], $status);
        });
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
