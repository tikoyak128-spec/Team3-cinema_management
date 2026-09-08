<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CinemaController;
use App\Http\Controllers\MovieController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\SeatController;
use App\Http\Controllers\ShowtimeController;
use App\Http\Controllers\TicketController;
use Illuminate\Support\Facades\Route;

// Authentication (public)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Google OAuth
Route::get('/auth/google', [AuthController::class, 'googleRedirect']);
Route::get('/auth/google/callback', [AuthController::class, 'googleCallback']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});

Route::apiResource('movies', MovieController::class);
Route::apiResource('categories', CategoryController::class);
Route::apiResource('cinemas', CinemaController::class);
Route::apiResource('rooms', RoomController::class);
Route::apiResource('seats', SeatController::class);
Route::apiResource('showtimes', ShowtimeController::class);
Route::apiResource('bookings', BookingController::class)->only(['index', 'store', 'show']);

Route::get('tickets/{ticket}', [TicketController::class, 'show']);
Route::post('tickets/{ticket}/check-in', [TicketController::class, 'checkIn']);
