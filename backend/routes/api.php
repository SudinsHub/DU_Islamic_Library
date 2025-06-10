<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\API\AuthorController;
use App\Http\Controllers\API\BookCollectionController;
use App\Http\Controllers\API\PublisherController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashBoardController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\HallController;
use App\Http\Controllers\LendingController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ReadingHistoryController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\VolunteerController;
use App\Http\Controllers\WishlistController;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\ReaderMiddleware;
use App\Http\Middleware\VolunteerMiddleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\PointSystem;
// create point system model

Route::post('/point', function () {
    PointSystem::create([
        'activity_type' => 'book_return',
        'points' => 10,
        'description' => 'Returned in time',
    ]);
    PointSystem::create([
        'activity_type' => 'book_lending',
        'points' => 5,
        'description' => 'Borrowed book',
    ]);
    PointSystem::create([
        'activity_type' => 'book_review',
        'points' => 25,
        'description' => 'Reviewed book',
    ]);
    PointSystem::create([
        'activity_type' => 'volunteer_task',
        'points' => 10,
        'description' => 'Completed a volunteer task.',
    ]);
    PointSystem::create([
        'activity_type' => 'event_participation',
        'points' => 15,
        'description' => 'Participated in an event.',
    ]);
    PointSystem::create([
        'activity_type' => 'reader_registration',
        'points' => 10,
        'description' => 'Registering as a reader.',
    ]);
    PointSystem::create([
        'activity_type' => 'delayed_return',
        'points' => -5,
        'description' => 'Returned late',
    ]);
    return response()->json(['message' => 'Point system created successfully.']);
});



Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

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
    Route::apiResource('vol', VolunteerController::class);
    Route::post('vol/toggle-availability', [VolunteerController::class, 'toggleAvailability']);
    
    Route::patch('request/fulfill', [RequestController::class, 'fulfill']);
    Route::patch('request/cancel', [RequestController::class, 'cancel']);
    Route::apiResource('request', RequestController::class);
    
    // Logout the authenticated user by revoking their current token
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('books', [BookController::class, 'store']);

    
    Route::patch('lendings/return', [LendingController::class, 'returnBook']);
    Route::patch('lendings/lost', [LendingController::class, 'markLost']);
    Route::apiResource('lendings', LendingController::class);
    Route::apiResource('reviews', ReviewController::class);
    // --- Routes protected by specific role middleware ---

    // Admin specific routes
    Route::middleware(AdminMiddleware::class)->group(function () {
        // Add more admin-specific routes here
    });

    // Reader specific routes
    Route::middleware(ReaderMiddleware::class)->group(function () {
        Route::get('/reader/dashboard', [DashBoardController::class, 'getDashboardInfo']);
        Route::get('/my-reads', [DashBoardController::class, 'getMyReads']);
        Route::apiResource('/wish', WishlistController::class);

    });

    // Volunteer specific routes
    Route::middleware(VolunteerMiddleware::class)->group(function () {
        Route::get('/volunteer/tasks', function () {
            return response()->json(['message' => 'Here are the tasks for volunteers. You have volunteer privileges.']);
        });
    });

    // You can also have routes accessible by any authenticated user,
    // but without specific role middleware if desired.
    Route::get('/authenticated-only', function () {
        return response()->json(['message' => 'This route is accessible by any authenticated user.']);
    });
});


// router for books
Route::get('books/search', [BookController::class, 'search']);
Route::apiResource('books', BookController::class)->except(['store']);  
Route::apiResource('publishers', PublisherController::class);
Route::apiResource('departments', DepartmentController::class);
Route::apiResource('categories', CategoryController::class);
Route::apiResource('authors', AuthorController::class);
Route::apiResource('halls', HallController::class);
Route::apiResource('collections', BookCollectionController::class);

Route::apiResource('reading-histories', ReadingHistoryController::class);
