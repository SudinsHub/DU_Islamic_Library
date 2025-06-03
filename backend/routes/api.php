<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\API\AuthorController;
use App\Http\Controllers\API\BookCollectionController;
use App\Http\Controllers\API\PublisherController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\HallController;
use App\Http\Controllers\LendingController;
use App\Http\Controllers\ReaderController;
use App\Http\Controllers\ReadingHistoryController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\VolunteerController;
use App\Http\Controllers\WishlistController;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\ReaderMiddleware;
use App\Http\Middleware\VolunteerMiddleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;





Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Route::apiResource('r', ReaderController::class)->middleware('auth:sanctum');
// Route::apiResource('a', AdminController::class)->middleware('auth:sanctum');
// Route::apiResource('v', VolunteerController::class)->middleware('auth:sanctum');

Route::post('/register/admin', [AuthController::class, 'registerAdmin']);
Route::post('/register/reader', [AuthController::class, 'registerReader']);
Route::post('/register/volunteer', [AuthController::class, 'registerVolunteer']);

// Public routes for user login
Route::post('/login/admin', [AuthController::class, 'loginAdmin']);
Route::post('/login/reader', [AuthController::class, 'loginReader']);
Route::post('/login/volunteer', [AuthController::class, 'loginVolunteer']);

// Protected routes that require a valid Sanctum token
Route::middleware('auth:sanctum')->group(function () {
    // Get currently authenticated user details
    Route::get('/user', [AuthController::class, 'user']);

    // Logout the authenticated user by revoking their current token
    Route::post('/logout', [AuthController::class, 'logout']);

    // --- Routes protected by specific role middleware ---

    // Admin specific routes
    Route::middleware(AdminMiddleware::class)->group(function () {
        Route::get('/admin/dashboard', function () {
            return response()->json(['message' => 'Welcome to the Admin Dashboard! You have admin privileges.']);
        });
        // Add more admin-specific routes here
    });

    // Reader specific routes
    Route::middleware(ReaderMiddleware::class)->group(function () {
        Route::apiResource("wish", WishlistController::class);
    });

    // Volunteer specific routes
    Route::middleware(VolunteerMiddleware::class)->group(function () {
        Route::get('/volunteer/tasks', function () {
            return response()->json(['message' => 'Here are the tasks for volunteers. You have volunteer privileges.']);
        });
        // Add more volunteer-specific routes here
    });

    // You can also have routes accessible by any authenticated user,
    // but without specific role middleware if desired.
    Route::get('/authenticated-only', function () {
        return response()->json(['message' => 'This route is accessible by any authenticated user.']);
    });
});


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
