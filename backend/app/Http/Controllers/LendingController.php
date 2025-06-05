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
use Illuminate\Http\Request; // Import the Request class
use Illuminate\Support\Str; // For UUID generation if needed
use App\Models\Request as LibraryRequest; // Alias for the Request model

class LendingController extends Controller
{
    /**
     * Helper to get authenticated volunteer ID or throw unauthorized.
     * @param \Illuminate\Http\Request $request
     * @return string
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException
     */
    protected function getVolunteerId(Request $request): string
    {
        // Access the authenticated user via $request->user() with Sanctum
        $user = $request->user(); 
        
        if (!$user) {
            abort(Response::HTTP_UNAUTHORIZED, 'Authentication required.');
        }

        // Assuming your User model has a 'volunteer_id' column or a relationship to Volunteer
        $volunteerId = $user->volunteer_id ?? null; // Adjust if volunteer_id is via a relationship, e.g., $user->volunteer->volunteer_id

        if (!$volunteerId) {
            // More robust check: Does the user have a 'volunteer' role/permission?
            // if (!$user->hasRole('volunteer')) { // Requires a package like Spatie/Laravel-Permission
            //     abort(Response::HTTP_FORBIDDEN, 'User does not have volunteer privileges.'); // 403 Forbidden
            // }

            // If the user *must* be a volunteer based on volunteer_id column in User model
            abort(Response::HTTP_FORBIDDEN, 'Authenticated user is not associated with a volunteer account.'); // 403 Forbidden
        }
        return $volunteerId;
    }


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
                return response()->json(['message' => 'Hall ID is required'], Response::HTTP_BAD_REQUEST); // 400 Bad Request
            }
        }
        // lending with that hall and whose status is pending
        $lendings = Lending::with(['request.reader', 'request.book', 'request.hall'])
            ->whereHas('request', function ($query) use ($hallId) {
                $query->where('hall_id', $hallId);
            })
            ->where('status', 'pending')
            ->orderBy('return_date', 'desc')
            ->get();

        return response()->json([
            'message' => 'Lendings retrieved successfully.',
            'data' => $lendings,
            'success' => true
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreLendingRequest $request): JsonResponse
    {
        // Pass the $request object to the helper method
        $volunteerId = $this->getVolunteerId($request);

        DB::beginTransaction();
        try {
            // Find the associated request
            $libraryRequest = LibraryRequest::findOrFail($request->req_id);

            // Get the book collection associated with the request's book and hall
            $bookCollection = BookCollection::where('book_id', $libraryRequest->book_id)
                                            ->where('hall_id', $libraryRequest->hall_id)
                                            ->first();

            if (!$bookCollection || $bookCollection->available_copies <= 0) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Cannot create lending: Book not available in the specified hall or no copies left.'
                ], Response::HTTP_CONFLICT); // 409 Conflict
            }
            
            // 1. Decrement available_copies in BookCollection
            $bookCollection->decrement('available_copies');

            // 2. Create the Lending record
            // Ensure volunteer_id from auth is used, even if not directly passed in request.
            $validatedData = $request->validated();
            $validatedData['volunteer_id'] = $volunteerId; // Override with authenticated volunteer_id

            $lending = Lending::create($validatedData);

            // 3. Link the Lending record to the Request (set status to fulfilled and add lending_id)
            $libraryRequest->status = 'fulfilled';
            $libraryRequest->lending_id = $lending->lending_id;
            $libraryRequest->save();
            
            DB::commit();
            return response()->json([
                'message' => 'Lending created, associated request fulfilled, and book availability updated.',
                'data' => $lending->load(['volunteer', 'request'])
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create lending.',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
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
    public function update(UpdateRequestRequest $request, Lending $lending): JsonResponse
    {
        $this->getVolunteerId($request); // Ensure authorized volunteer
        
        $lending->update($request->validated());
        return response()->json([
            'message' => 'Lending updated successfully.',
            'data' => $lending
        ]);
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
            $lending->return_date = $request->input('return_date', now()->toDateString());
            $lending->save();

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