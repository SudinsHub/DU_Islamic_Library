<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BookController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ReaderController;
use App\Http\Controllers\LendingController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\VolunteerController;
use App\Http\Controllers\API\AuthorController;
use App\Http\Controllers\API\PublisherController;
use App\Http\Controllers\ReadingHistoryController;
use App\Http\Controllers\API\BookCollectionController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\HallController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Route::apiResource('r', ReaderController::class)->middleware('auth:sanctum');
// Route::apiResource('a', AdminController::class)->middleware('auth:sanctum');
// Route::apiResource('v', VolunteerController::class)->middleware('auth:sanctum');

Route::post('/v/register', [VolunteerController::class, 'register']);
Route::post('/v/login', [VolunteerController::class, 'login']);
Route::post('/v/logout', [VolunteerController::class, 'logout'])->middleware(['auth:sanctum', 'volunteer']);

Route::post('/a/register', [AdminController::class, 'register']);
Route::post('/a/login', [AdminController::class, 'login']);
Route::post('/a/logout', [AdminController::class, 'logout'])->middleware(['auth:sanctum', 'admin']);

Route::post('/r/register', [ReaderController::class, 'register']);
Route::post('/r/login', [ReaderController::class, 'login']);
Route::post('/r/logout', [ReaderController::class, 'logout'])->middleware(['auth:sanctum', 'reader']);

// router for books
Route::apiResource('books', BookController::class);
Route::apiResource('publishers', PublisherController::class);
Route::apiResource('categories', CategoryController::class);
Route::apiResource('authors', AuthorController::class);
Route::apiResource('halls', HallController::class);
Route::apiResource('collections', BookCollectionController::class);
Route::apiResource('requests', RequestController::class);
Route::patch('requests/{request}/fulfill', [RequestController::class, 'fulfill']);
Route::patch('requests/{request}/cancel', [RequestController::class, 'cancel']);
Route::apiResource('lendings', LendingController::class);
Route::patch('lendings/{lending}/return', [LendingController::class, 'returnBook']);
Route::patch('lendings/{lending}/lost', [LendingController::class, 'markLost']);
Route::apiResource('reading-histories', ReadingHistoryController::class);
