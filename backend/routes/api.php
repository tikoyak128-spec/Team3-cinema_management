<?php

use App\Http\Controllers\Auth\VerificationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CinemaController;
use App\Http\Controllers\MovieController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\SeatController;
use App\Http\Controllers\ShowtimeController;
use App\Http\Controllers\TicketController;
use Illuminate\Support\Facades\Route;

// Authentication (public)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp'])
    ->middleware('throttle:10,1')
    ->name('registration.verify');
Route::post('/resend-otp', [AuthController::class, 'resendOtp'])
    ->middleware('throttle:6,1')
    ->name('registration.resend');
Route::post('/login', [AuthController::class, 'login']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Email verification (resend is authenticated)
    Route::post('/email/resend', [VerificationController::class, 'resend'])
        ->middleware('throttle:6,1')
        ->name('verification.send');
});

// Email verification (signed URL from email; no token required)
Route::get('/email/verify/{id}/{hash}', [VerificationController::class, 'verify'])
    ->middleware('signed')
    ->name('verification.verify');

Route::apiResource('movies', MovieController::class);
Route::apiResource('categories', CategoryController::class);
Route::apiResource('cinemas', CinemaController::class);
Route::apiResource('rooms', RoomController::class);
Route::apiResource('seats', SeatController::class);
Route::apiResource('showtimes', ShowtimeController::class);
Route::apiResource('bookings', BookingController::class)->only(['index', 'store', 'show']);

Route::get('tickets/{ticket}', [TicketController::class, 'show']);
Route::post('tickets/{ticket}/check-in', [TicketController::class, 'checkIn']);

Route::get('reports', [ReportController::class, 'index']);
