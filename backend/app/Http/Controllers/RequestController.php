<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\CancelRequestRequest;
use App\Http\Requests\UpdateRequestRequest;
use App\Http\Requests\FulfillRequestRequest;
use App\Models\BookCollection; // To update book counts
use App\Models\Request as LibraryRequest; // Alias to avoid conflict
use Symfony\Component\HttpFoundation\Response; // For HTTP status codes
use App\Models\Lending;        // To create a new lending record upon fulfillment
use Termwind\Components\Li;

class RequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        // Start with a base query
        $query = LibraryRequest::with(['reader', 'book', 'hall']);

        // 1. Hall Filtering
        $hallId = null;
        if ($request->has('hall_id') && $request->input('hall_id') !== '') { // Check for empty string too
            $hallId = $request->input('hall_id');
        } else {
            // Default to the user's hall_id if logged in and no specific hall_id is provided
            if ($request->user() && $request->user()->hall_id) {
                $hallId = $request->user()->hall_id;
            }
        }

        if ($hallId) {
            $query->where('hall_id', $hallId);
        }

        // 2. Status Filtering
        $status = $request->input('status');
        if ($status && $status !== '') { // Check for empty string too for "All Statuses"
            $query->where('status', $status);
        } else {
            // If no specific status, fetch all relevant statuses
            $query->whereIn('status', ['pending', 'fulfilled', 'cancelled']);
        }

        // 3. Requested Date Filtering (Date Span)
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        if ($startDate) {
            $query->whereDate('request_date', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('request_date', '<=', $endDate);
        }

        // 4. Book-wise Filtering (by title)
        $bookTitle = $request->input('book_title');
        if ($bookTitle) {
            // Use whereHas to filter based on the related book's title
            $query->whereHas('book', function ($q) use ($bookTitle) {
                $q->where('title', 'like', '%' . $bookTitle . '%');
            });
        }

        // 5. Requested Date Sorting
        $sortBy = $request->input('sort_by', 'request_date'); // Default sort by request_date
        $sortOrder = $request->input('sort_order', 'desc'); // Default sort order 'desc'

        // Ensure valid sort column and order
        $allowedSortColumns = ['request_date']; // Add other sortable columns if needed
        $allowedSortOrders = ['asc', 'desc'];

        if (in_array($sortBy, $allowedSortColumns) && in_array($sortOrder, $allowedSortOrders)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            // Fallback to default sorting if invalid parameters are provided
            $query->orderBy('request_date', 'desc');
        }

        $requests = $query->get();

        return response()->json([
            'success' => true,
            'data' => $requests
        ], Response::HTTP_OK);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        // 1. Authorization Check (Manual)
        // Ensure the user is authenticated.
        if ($request->user() === null) {
            return response()->json([
                'message' => 'Unauthenticated. Please log in to make a request.'
            ], Response::HTTP_UNAUTHORIZED); // 401 Unauthorized
        }

        // Get the reader_id from the authenticated user.
        // This assumes your authenticated user object has a 'reader_id' property.
        // Adjust this if your User model links to Reader model differently.
        if($request->user()->reader_id) $authenticatedReaderId = $request->user()->reader_id ?? null;
        else $authenticatedReaderId = null;
        if (!$authenticatedReaderId) {
            return response()->json([
                'message' => 'Your user account is not associated with a valid profile.'
            ], Response::HTTP_FORBIDDEN); // 403 Forbidden
        }

        // 2. Manual Validation
        // Validate the incoming request data.
        // reader_id is derived from the authenticated user, so it's not validated from the request body.
        $validatedData = $request->validate([
            'book_id' => ['required', 'uuid', 'exists:books,book_id'],
            'hall_id' => ['required', 'uuid', 'exists:halls,hall_id'],
            // 'request_date' and 'status' are not expected from the request body
            // as they are set internally or by database defaults.
        ]);

        // Merge authenticated reader_id and default values for non-fillable fields.
        // Ensure 'request_date' and 'status' are either fillable in your model
        // or have database default values, otherwise they will be ignored by create().
        $dataToCreate = array_merge($validatedData, [
            'reader_id' => $authenticatedReaderId,
            // 'request_date' => now()->toDateString(), // Set default request date
            // 'status' => 'pending',                   // Set default status
        ]);

        // 3. Check book availability in the requested hall
        $bookCollection = BookCollection::where('book_id', $dataToCreate['book_id'])
                                       ->where('hall_id', $dataToCreate['hall_id'])
                                       ->first();

        if (!$bookCollection || $bookCollection->available_copies <= 0) {
            return response()->json([
                'message' => 'Book not available in the specified hall or no copies left.'
            ], Response::HTTP_BAD_REQUEST); // 400 Bad Request
        }

        // 4. Database Transaction
        DB::beginTransaction();
        try {
            // Decrement available copies as a request is made.
            // This ensures the count reflects reserved books.
            // $bookCollection->decrement('available_copies');

            // Create the library request record.
            $libraryRequest = LibraryRequest::create($dataToCreate);

            DB::commit(); // Commit the transaction if all operations succeed

            return response()->json([
                'message' => 'Request created successfully and book availability updated.',
                'data' => $libraryRequest
            ], Response::HTTP_CREATED); // 201 Created status

        } catch (\Exception $e) {
            DB::rollBack(); // Rollback the transaction if any error occurs
            Log::error('Failed to create request or update book availability', [
                'error' => $e->getMessage(),
                'data' => $dataToCreate
            ]);
            return response()->json([
                'message' => 'Failed to create request or update book availability.',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR); // 500 Internal Server Error status
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
    public function destroy(Request $request): JsonResponse
    {
        $request->validate([
            'req_id' => ['required', 'uuid', 'exists:requests,req_id'],
        ]);
        $libraryRequest = LibraryRequest::findOrFail($request->req_id);

        $libraryRequest->delete();
        return response()->json([
            'message' => 'Request deleted successfully.',
            'data' => $libraryRequest
        ], Response::HTTP_OK); // 200 OK
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
    public function fulfill(Request $request): JsonResponse
    {
        $request->validate([
            'return_date' => ['required', 'date', 'after_or_equal:today'],
            'req_id' => ['required', 'uuid', 'exists:requests,req_id'],
        ]);
        $libraryRequest = LibraryRequest::findOrFail($request->req_id);
        $user = $request->user();
        $handlerId = '';
        if (!$user) {
            abort(Response::HTTP_UNAUTHORIZED, 'Authenticated user is not a recognized volunteer.');
        } else $handlerId = ($user->volunteer_id);

        if ($libraryRequest->status !== 'pending') { 
            Log::warning('Attempt to fulfill a non-pending request', [
                'status' => $libraryRequest->status,
            ]);
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
                'volunteer_id' => $handlerId, // Use the authenticated volunteer's ID
                'req_id' => $libraryRequest->req_id,
                'issue_date' => now()->toDateString(),
                'return_date' => $request->return_date,
                'status' => 'pending', // Lending starts as pending until returned
            ]);

            // Decrement available copies in BookCollection (if not already done by Request@store)
            // If you decrement on Request@store, remove this line.
            // If you decrement on Lending@store (as we just set it up), then keep this here.
            $bookCollection->decrement('available_copies');


            // Update the request status and link the new lending
            $libraryRequest->status = 'fulfilled';
            $libraryRequest->save();

            $pointSystem = \App\Models\PointSystem::where('activity_type', 'book_lending')
                ->firstOrFail();

            // Add points to the reader's account
            $reader = $libraryRequest->reader;
            if (!$reader) {
                return response()->json([
                    'message' => 'Reader not found for the request.'
                ], Response::HTTP_NOT_FOUND); // 404 Not Found
            }
            $reader->increment('total_points', $pointSystem->points);
            \App\Models\PointHistory::create([
                'reader_id' => $reader->reader_id,
                'activity_type' => 'book_lending',
                'book_id' => $libraryRequest->book_id,
            ]);

            DB::commit();
            return response()->json([
                'message' => 'Request fulfilled and lending created successfully.',
                'success' => true,
                'data' => $libraryRequest->load('lending')
            ])->setStatusCode(Response::HTTP_OK); // 200 OK
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to fulfill request', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Failed to fulfill request.',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Cancel a pending request.
     */
    public function cancel(Request $request): JsonResponse
    {
        $request->validate([
            'req_id' => ['required', 'uuid', 'exists:requests,req_id'],
        ]);
        $libraryRequest = LibraryRequest::findOrFail($request->req_id);
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
            // $bookCollection = BookCollection::where('book_id', $libraryRequest->book_id)
            //                                 ->where('hall_id', $libraryRequest->hall_id)
            //                                 ->first();
            // if ($bookCollection) {
            //     $bookCollection->increment('available_copies');
            // }

            DB::commit();
            return response()->json([
                'message' => 'Request cancelled successfully.',
                'data' => $libraryRequest,
                'success' => true
            ])->setStatusCode(Response::HTTP_OK); // 200 OK
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to cancel request', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Failed to cancel request.',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR); // 500 Internal Server Error
        }
    }
}