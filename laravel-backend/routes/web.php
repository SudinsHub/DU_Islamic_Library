<?php

use Illuminate\Support\Facades\Route;

// Basic health check
Route::get('/', function () {
    return response()->json(['message' => 'Home route is running', 'status' => 'OK']);
});