<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Requests\UpdateReviewRequest;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\Request; // Don't forget to import Request

class ReviewController extends Controller
{
    /**
     * Display a listing of the resource.
     * Readers and Admins can view all reviews.
     */
    public function index(): JsonResponse
    {
        $reviews = Review::with(['reader', 'book'])->get();
        return response()->json($reviews);
    }

    /**
     * Store a newly created resource in storage.
     * Only authenticated readers can create reviews.
     */
    public function store(StoreReviewRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            // The reader_id is already merged into the request in StoreReviewRequest::prepareForValidation
            $review = Review::create($request->validated());

            DB::commit();
            return response()->json([
                'message' => 'Review created successfully.',
                'data' => $review->load(['reader', 'book'])
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create review.',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified resource.
     * Anyone (readers/admins/guests) can view a specific review.
     */
    public function show(Review $review): JsonResponse
    {
        return response()->json($review->load(['reader', 'book']));
    }

    /**
     * Update the specified resource in storage.
     * Only the original reader or an admin can update.
     */
    public function update(UpdateReviewRequest $request, Review $review): JsonResponse
    {
        DB::beginTransaction();
        try {
            $review->update($request->validated());
            DB::commit();
            return response()->json([
                'message' => 'Review updated successfully.',
                'data' => $review->load(['reader', 'book'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update review.',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified resource from storage.
     * Only the original reader or an admin can delete.
     */
    public function destroy(Request $request, Review $review): JsonResponse // Inject Request for authorization
    {
        // Authorize using the same logic as UpdateReviewRequest
        $user = $request->user();
        if (!$user) {
            abort(Response::HTTP_UNAUTHORIZED, 'Authentication required.');
        }

        $isAdmin = $user->is_admin ?? false;
        $isOriginalReader = $review->reader_id === ($user->reader_id ?? null);

        if (!$isAdmin && !$isOriginalReader) {
            abort(Response::HTTP_FORBIDDEN, 'You are not authorized to delete this review.');
        }

        DB::beginTransaction();
        try {
            $review->delete();
            DB::commit();
            return response()->json(null, Response::HTTP_NO_CONTENT);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete review.',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}