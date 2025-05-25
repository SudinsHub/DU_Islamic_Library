<?php

namespace App\Http\Controllers;

use App\Models\ReadingHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;
use App\Http\Requests\StoreReadingHistoryRequest;
use App\Http\Requests\UpdateReadingHistoryRequest;
use Illuminate\Http\Request; // Don't forget to import Request

class ReadingHistoryController extends Controller
{
    /**
     * Display a listing of the resource.
     * Readers can view their own history. Admins can view all or filter.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $isAdmin = $user->is_admin ?? false;
        $readerId = $user->reader_id ?? null;

        $query = ReadingHistory::with(['reader', 'book']);

        // If not an admin, only show the current reader's history
        if (!$isAdmin && $readerId) {
            $query->where('reader_id', $readerId);
        } elseif (!$isAdmin && !$readerId) {
            // Not admin and not a reader account (e.g., just a regular user)
            return response()->json([
                'message' => 'Not authorized to view reading history.'
            ], Response::HTTP_FORBIDDEN);
        }

        // Admins might want to filter by reader_id or book_id
        if ($isAdmin) {
            if ($request->has('reader_id')) {
                $query->where('reader_id', $request->input('reader_id'));
            }
            if ($request->has('book_id')) {
                $query->where('book_id', $request->input('book_id'));
            }
        }

        $readingHistories = $query->get();
        return response()->json($readingHistories);
    }

    /**
     * Store a newly created resource in storage.
     * Only authorized readers/admins can create entries.
     */
    public function store(StoreReadingHistoryRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            // reader_id is already merged into the request in StoreReadingHistoryRequest::prepareForValidation
            $readingHistory = ReadingHistory::create($request->validated());

            DB::commit();
            return response()->json([
                'message' => 'Reading history entry created successfully.',
                'data' => $readingHistory->load(['reader', 'book'])
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create reading history entry.',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified resource.
     * Only the owner reader or an admin can view a specific entry.
     */
    public function show(Request $request, ReadingHistory $readingHistory): JsonResponse
    {
        // Authorization check (similar to Update/Destroy)
        $user = $request->user();
        $isAdmin = $user->is_admin ?? false;
        $isOriginalReader = $readingHistory->reader_id === ($user->reader_id ?? null);

        if (!$isAdmin && !$isOriginalReader) {
            abort(Response::HTTP_FORBIDDEN, 'You are not authorized to view this reading history entry.');
        }

        return response()->json($readingHistory->load(['reader', 'book']));
    }

    /**
     * Update the specified resource in storage.
     * Only the owner reader or an admin can update.
     */
    public function update(UpdateReadingHistoryRequest $request, ReadingHistory $readingHistory): JsonResponse
    {
        DB::beginTransaction();
        try {
            $readingHistory->update($request->validated());
            DB::commit();
            return response()->json([
                'message' => 'Reading history entry updated successfully.',
                'data' => $readingHistory->load(['reader', 'book'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update reading history entry.',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified resource from storage.
     * Only the owner reader or an admin can delete.
     */
    public function destroy(Request $request, ReadingHistory $readingHistory): JsonResponse
    {
        // Authorization check (similar to Update/Show)
        $user = $request->user();
        if (!$user) {
            abort(Response::HTTP_UNAUTHORIZED, 'Authentication required.');
        }

        $isAdmin = $user->is_admin ?? false;
        $isOriginalReader = $readingHistory->reader_id === ($user->reader_id ?? null);

        if (!$isAdmin && !$isOriginalReader) {
            abort(Response::HTTP_FORBIDDEN, 'You are not authorized to delete this reading history entry.');
        }

        DB::beginTransaction();
        try {
            $readingHistory->delete();
            DB::commit();
            return response()->json(null, Response::HTTP_NO_CONTENT);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete reading history entry.',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}