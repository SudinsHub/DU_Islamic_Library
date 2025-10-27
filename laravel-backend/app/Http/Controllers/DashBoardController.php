<?php

namespace App\Http\Controllers;

use App\Models\Lending;
use App\Models\PointHistory;
use App\Models\Request as ModelsRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;

class DashBoardController
{
    public function getDashboardInfo(Request $request): JsonResponse
    {
        $reader = $request->user();
        if (!$reader) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED); // 401 Unauthorized
        }

        $achievedPoints = $reader->total_points;

        // find lendings of the current user via request relation
        $myLendings = Lending::whereHas('request', function ($query) use ($reader) {
            $query->where('reader_id', $reader->id);
        });
        
        $returnedCount = $myLendings->where('status', 'returned')->count();
        $pendingCount = $myLendings->where('status', 'pending')->count();

        // rank positions on the basis of total_points of readers
        $rankedReaders = \App\Models\Reader::orderBy('total_points', 'desc')->get();
        $rankPosition = $rankedReaders->search(function ($item) use ($reader) {
            return $item->reader_id === $reader->reader_id;
        });
        if ($rankPosition === false) {
            $rankPosition = null; // Reader not found in the ranking
        } else {
            $rankPosition += 1; // Convert to 1-based index
        }

        $activities = PointHistory::where('reader_id', $reader->reader_id)
            ->with(['point_system', 'book'])
            ->limit(15)
            ->orderBy('earned_date', 'desc') 
            ->get();

        return response()->json([
            'message' => 'Returned count retrieved successfully.',
            'retunedCount' => $returnedCount,
            'pendingCount' => $pendingCount,
            'achievedPoints' => $achievedPoints,
            'rankPosition' => $rankPosition,
            'activities' => $activities,
            'success'=> true
        ], Response::HTTP_OK); // 200 OK
;
    }

    public function getMyReads(Request $request): JsonResponse
    {
        $reader = $request->user();
        if (!$reader) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED); // 401 Unauthorized
        }
        // currently reading
        $currentReads = Lending::whereHas('request', function ($query) use ($reader) {
            $query->where('reader_id', $reader->reader_id);
        })->where('status', 'pending')
            ->with(['request.book', 'request.book.author'])
          ->orderBy('return_date', 'desc')
          ->get();

        // pending requests
        $pendingRequests = ModelsRequest::where('reader_id', $reader->reader_id)
          ->where('status', 'pending')        
          ->with(['book', 'book.author'])
          ->orderBy('request_date', 'desc')
          ->get();

        // completed reads
        $completedReads = Lending::whereHas('request', function ($query) use ($reader) {
            $query->where('reader_id', $reader->reader_id);
        })
          ->where('status', 'returned')
          ->with(['request.book', 'request.book.author'])
          ->orderBy('return_date', 'desc')
          ->get();

        return response()->json([
            'message' => 'My reads retrieved successfully.',
            'currentReads' => $currentReads,
            'pendingRequests' => $pendingRequests,
            'completedReads' => $completedReads,
            'success'=> true
        ], Response::HTTP_OK); // 200 OK
    }


}
