<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreRequestRequest;
use App\Http\Requests\CancelRequestRequest;
use App\Http\Requests\UpdateRequestRequest;
use App\Http\Requests\FulfillRequestRequest;
use App\Models\BookCollection; // To update book counts
use App\Models\Request as LibraryRequest; // Alias to avoid conflict
use Symfony\Component\HttpFoundation\Response; // For HTTP status codes
use App\Models\Lending;        // To create a new lending record upon fulfillment

class RequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $requests = LibraryRequest::with(['reader', 'book', 'hall'])->get();
        return response()->json($requests);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRequestRequest $request): JsonResponse
    {
        // Check book availability in the requested hall
        $bookCollection = BookCollection::where('book_id', $request->book_id)
                                        ->where('hall_id', $request->hall_id)
                                        ->first();

        if (!$bookCollection || $bookCollection->available_copies <= 0) {
            return response()->json([
                'message' => 'Book not available in the specified hall or no copies left.'
            ], Response::HTTP_BAD_REQUEST); // 400 Bad Request
        }

        // Decrement available copies immediately if a request is placed (optional, depends on workflow)
        // If you only decrement on lending, remove this part.
        // For simplicity, let's decrement upon creation of a *pending* request.
        // This is a business logic decision.
        DB::beginTransaction();
        try {
            // $bookCollection->decrement('available_copies');

            $libraryRequest = LibraryRequest::create($request->validated());

            DB::commit();
            return response()->json([
                'message' => 'Request created successfully and book availability updated.',
                'data' => $libraryRequest
            ], Response::HTTP_CREATED); // 201 Created
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create request or update book availability.',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR); // 500 Internal Server Error
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(LibraryRequest $request): JsonResponse
    {
        return response()->json($request->load(['reader', 'book', 'hall']));
    }

    /**
     * Update the specified resource in storage.
     * (General update, use specific actions for status changes like fulfill/cancel)
     */
    public function update(UpdateRequestRequest $request, LibraryRequest $libraryRequest): JsonResponse
    {
        $libraryRequest->update($request->validated());
        return response()->json([
            'message' => 'Request updated successfully.',
            'data' => $libraryRequest
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(LibraryRequest $request): JsonResponse
    {
        // Before deleting, if the request was pending and decremented copies, increment them back
        if ($request->status === 'pending') { // Only for pending requests that decremented on creation
             $bookCollection = BookCollection::where('book_id', $request->book_id)
                                             ->where('hall_id', $request->hall_id)
                                             ->first();
            if ($bookCollection) {
                $bookCollection->increment('available_copies');
            }
        }
        
        $request->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT); // 204 No Content
    }

    // --- Custom Actions for Request Status ---

/**
     * Fulfill a pending request.
     * This action will now ensure the request is ready,
     * and then delegate to the LendingController (conceptually) to create the actual lending.
     *
     * @param \App\Http\Requests\FulfillRequestRequest $request
     * @param \App\Models\Request $libraryRequest
     * @return \Illuminate\Http\JsonResponse
     */
    public function fulfill(FulfillRequestRequest $request, LibraryRequest $libraryRequest): JsonResponse
    {
        // Get the authenticated user (volunteer) for authorization
        $user = $request->user();
        if (!$user || !($user->volunteer_id ?? null)) {
            abort(Response::HTTP_UNAUTHORIZED, 'Authenticated user is not a recognized volunteer.');
        }

        if ($libraryRequest->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending requests can be fulfilled.'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Check book availability in the requested hall before fulfilling.
        $bookCollection = BookCollection::where('book_id', $libraryRequest->book_id)
                                        ->where('hall_id', $libraryRequest->hall_id)
                                        ->first();

        if (!$bookCollection || $bookCollection->available_copies <= 0) {
            return response()->json([
                'message' => 'Cannot fulfill request: Book not available in the specified hall or no copies left.'
            ], Response::HTTP_CONFLICT); // 409 Conflict
        }
        
        // This is the crucial change:
        // Instead of creating Lending here, we prepare data and conceptually
        // "call" the LendingController@store logic.
        // For actual API call, use Guzzle. For internal, we can just instantiate.
        // Or, more robustly, this endpoint *just* changes the request status to 'fulfilled'
        // and provides data to create a lending. The *actual* lending creation would be a separate POST to /api/lendings.
        // Given your current flow, let's keep it creating Lending here for simplicity of example.

        DB::beginTransaction();
        try {
            // Create a new Lending record - this logic was moved from LendingController@store
            // to here, as this is the "fulfill" action.
            // The volunteer_id must come from the authenticated user.
            $lending = Lending::create([
                'volunteer_id' => $user->volunteer_id, // Use the authenticated volunteer's ID
                'req_id' => $libraryRequest->req_id,
                'issue_date' => now()->toDateString(),
                'status' => 'pending', // Lending starts as pending until returned
            ]);

            // Decrement available copies in BookCollection (if not already done by Request@store)
            // If you decrement on Request@store, remove this line.
            // If you decrement on Lending@store (as we just set it up), then keep this here.
            $bookCollection->decrement('available_copies');


            // Update the request status and link the new lending
            $libraryRequest->status = 'fulfilled';
            $libraryRequest->save();

            DB::commit();
            return response()->json([
                'message' => 'Request fulfilled and lending created successfully.',
                'data' => $libraryRequest->load('lending')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to fulfill request.',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Cancel a pending request.
     */
    public function cancel(CancelRequestRequest $request, LibraryRequest $libraryRequest): JsonResponse
    {
        if ($libraryRequest->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending requests can be cancelled.'
            ], Response::HTTP_BAD_REQUEST); // 400 Bad Request
        }
        
        DB::beginTransaction();
        try {
            $libraryRequest->status = 'cancelled';
            $libraryRequest->save();

            // If you decremented available_copies on request creation, increment it back
            $bookCollection = BookCollection::where('book_id', $libraryRequest->book_id)
                                            ->where('hall_id', $libraryRequest->hall_id)
                                            ->first();
            if ($bookCollection) {
                $bookCollection->increment('available_copies');
            }

            DB::commit();
            return response()->json([
                'message' => 'Request cancelled successfully.',
                'data' => $libraryRequest
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to cancel request.',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR); // 500 Internal Server Error
        }
    }
}