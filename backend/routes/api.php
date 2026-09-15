<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CinemaController;
use App\Http\Controllers\MovieController;
use App\Http\Controllers\PromotionController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\SeatController;
use App\Http\Controllers\ShowtimeController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\UserController;
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
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    Route::post('/upload/image', [UploadController::class, 'uploadImage']);
    Route::post('/upload/video', [UploadController::class, 'uploadVideo']);
    Route::post('/upload', [UploadController::class, 'uploadFile']);
});

// Public resource routes (read-only for customers)
Route::apiResource('movies', MovieController::class)->only(['index', 'show']);
Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);
Route::apiResource('cinemas', CinemaController::class)->only(['index', 'show']);
Route::apiResource('showtimes', ShowtimeController::class)->only(['index', 'show']);
Route::apiResource('promotions', PromotionController::class)->only(['index', 'show']);
Route::apiResource('seats', SeatController::class)->only(['index', 'show']);

// Bookings (authenticated users)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('bookings/my', [BookingController::class, 'myBookings']);
    Route::apiResource('bookings', BookingController::class)->only(['index', 'store', 'show']);
    Route::get('bookings/{id}/payment', [BookingController::class, 'checkPayment']);
});

Route::get('tickets/{ticket}', [TicketController::class, 'show']);
Route::post('tickets/{ticket}/check-in', [TicketController::class, 'checkIn']);

// Staff-only routes (staff + admin)
Route::middleware(['auth:sanctum', 'staff'])->prefix('staff')->group(function () {
    Route::get('bookings/search', [BookingController::class, 'searchByCode']);
    Route::get('tickets/search', [TicketController::class, 'searchByCode']);
    Route::apiResource('bookings', BookingController::class)->only(['index', 'show']);
    Route::post('bookings', [BookingController::class, 'storeStaff']);
    Route::get('showtimes', [ShowtimeController::class, 'index']);
    Route::get('showtimes/{showtime}', [ShowtimeController::class, 'show']);
    Route::get('showtimes/{showtime}/seats', [SeatController::class, 'forShowtime']);
    Route::apiResource('rooms', RoomController::class)->only(['index', 'show']);
    Route::apiResource('seats', SeatController::class)->only(['index', 'show']);
    Route::get('tickets/{ticket}', [TicketController::class, 'show']);
    Route::post('tickets/{ticket}/check-in', [TicketController::class, 'checkIn']);
});

// Admin-only routes (full CRUD)
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::apiResource('movies', MovieController::class)->except(['index', 'show']);
    Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);
    Route::apiResource('cinemas', CinemaController::class)->except(['index', 'show']);
    Route::apiResource('rooms', RoomController::class);
    Route::apiResource('seats', SeatController::class)->except(['index', 'show']);
    Route::apiResource('showtimes', ShowtimeController::class)->except(['index', 'show']);
    Route::apiResource('promotions', PromotionController::class)->except(['index', 'show']);

    Route::apiResource('users', UserController::class);
});
