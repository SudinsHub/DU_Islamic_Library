<?php

namespace App\Http\Controllers;

use App\Models\Lending;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\MarkLostRequest;
use App\Http\Requests\ReturnBookRequest;
use App\Http\Requests\StoreLendingRequest;
use App\Http\Requests\UpdateLendingRequest;
use App\Http\Requests\UpdateRequestRequest;
use Symfony\Component\HttpFoundation\Response;
use App\Models\BookCollection; // To update book counts
use App\Models\PointHistory;
use App\Models\PointSystem;
use App\Models\Reader;
use Illuminate\Http\Request; // Import the Request class
use Illuminate\Support\Str; // For UUID generation if needed
use App\Models\Request as LibraryRequest; // Alias for the Request model

class LendingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        if($request->has('hall_id')) {
            $hallId = $request->input('hall_id');
        }
        else {
            if ($request->user() && $request->user()->hall_id) {
                $hallId = $request->user()->hall_id; 
            } else {
                $hallId = null; // Default to null if no hall_id is provided
            }
        }

        if(!$hallId) {
        // lending with that hall and whose status is pending
            $lendings = Lending::with(['request.reader', 'request.book', 'request.hall'])
                ->where('status', 'pending')
                ->orderBy('return_date', 'desc')
                ->get();
        }
        else {
            // lending with that hall and whose status is pending
            $lendings = Lending::with(['request.reader', 'request.book', 'request.hall'])
            ->whereHas('request', function ($query) use ($hallId) {
                $query->where('hall_id', $hallId);
            })
            ->where('status', 'pending')
            ->orderBy('return_date', 'desc')
            ->get();
        }

        return response()->json([
            'message' => 'Lendings retrieved successfully.',
            'data' => $lendings,
            'success' => true
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreLendingRequest $request)
    {
        //
        
    }

    /**
     * Display the specified resource.
     */
    public function show(Lending $lending): JsonResponse
    {
        return response()->json($lending->load(['volunteer', 'request.reader', 'request.book', 'request.hall']));
    }

    /**
     * Update the specified resource in storage.
     * (General update, use specific actions for status changes like return/markLost)
     */
    public function update(UpdateRequestRequest $request, Lending $lending){
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Lending $lending): JsonResponse
    {
        $this->getVolunteerId($request); // Ensure authorized volunteer

        DB::beginTransaction();
        try {
            if ($lending->status === 'pending') {
                $bookCollection = BookCollection::where('book_id', $lending->request->book_id)
                                                ->where('hall_id', $lending->request->hall->hall_id) // Corrected access to hall_id
                                                ->first();
                if ($bookCollection) {
                    $bookCollection->increment('available_copies');
                }
            }
            
            if ($lending->request) {
                $lending->request->status = 'pending'; 
                $lending->request->lending_id = null;
                $lending->request->save();
            }

            $lending->delete();
            DB::commit();
            return response()->json(null, Response::HTTP_NO_CONTENT);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete lending.',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    // --- Custom Actions for Lending Status ---

    /**
     * Mark a book as returned.
     */
    public function returnBook(Request $request): JsonResponse
    {

        $lendingId = $request->input('lending_id');
        $request->validate([
            'lending_id' => ['required', 'exists:lendings,lending_id']
        ]);

        $lending = Lending::find($lendingId);
        if (!$lending) {
            return response()->json([
                'message' => 'Lending not found.'
            ], Response::HTTP_NOT_FOUND);
        }
        
        if ($lending->status === 'returned' || $lending->status === 'lost') {
            return response()->json([
                'message' => 'Book is already marked as returned or lost.'
            ], Response::HTTP_BAD_REQUEST);
        }
        DB::beginTransaction();
        try {
            $lending->status = 'returned';
            $lending->return_date = now()->toDateString();
            $lending->save();

            $book_return = PointSystem::where('activity_type', 'book_return')
                        ->firstOrfail();
            // Add points to the reader's account
            // $reader_id = $lending->request->reader_id;
            // $reader = Reader::find($reader_id);
            $reader = $lending->request->reader;
            if (!$reader) {
                return response()->json([
                    'message' => 'Reader not found.'
                ], Response::HTTP_NOT_FOUND);
            }
            $reader->increment('total_points', $book_return->points);
            $reader->save();
            PointHistory::create([
                'reader_id' => $lending->request->reader_id,
                'activity_type' => 'book_return', 
                'book_id' => $lending->request->book_id,
            ]);

            // Increment available_copies in BookCollection
            // Fetch book_id and hall_id through the associated request.
            if ($lending->request) {
                $bookCollection = BookCollection::where('book_id', $lending->request->book_id)
                                                ->where('hall_id', $lending->request->hall_id)
                                                ->first();
                if ($bookCollection) {
                    $bookCollection->increment('available_copies');
                } else {
                    // Log or handle case where BookCollection is not found (shouldn't happen if data integrity is good)
                    Log::warning("BookCollection not found for lending {$lending->lending_id} on return.");
                }
            } else {
                 Log::warning("Request not found for lending {$lending->lending_id} on return.");
            }

            DB::commit();
            return response()->json([
                'message' => 'Book marked as returned successfully.',
                'data' => $lending,
                'success' => true
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to mark book as returned.',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Mark a book as lost.
     */
    public function markLost(Request $request): JsonResponse
    {
        $lendingId = $request->input('lending_id');
        if (!$lendingId) {
            return response()->json([
                'message' => 'Lending ID is required.'
            ], Response::HTTP_BAD_REQUEST);
        }

        
        $lending = Lending::find($lendingId);
        if (!$lending) {
            return response()->json([
                'message' => 'Lending not found.'
            ], Response::HTTP_NOT_FOUND);
        }
        
        if ($lending->status === 'returned' || $lending->status === 'lost') {
            return response()->json([
                'message' => 'Book is already marked as returned or lost.'
            ], Response::HTTP_BAD_REQUEST);
        }
        DB::beginTransaction();
        try {
            $lending->status = 'lost';
            $lending->save();

            DB::commit();
            return response()->json([
                'message' => 'Book lost!',
                'data' => $lending
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to mark book as lost.',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}