<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MovieCategoryController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Admin\MovieController;
use App\Http\Controllers\Api\Admin\BookingController;
use App\Http\Controllers\Api\Admin\CinemaController;
use App\Http\Controllers\Api\Admin\RoomController;
use App\Http\Controllers\Api\Admin\ShowtimeController;
use App\Http\Controllers\Api\Admin\SeatController;
use App\Http\Controllers\Api\ShowtimeController as PublicShowtimeController;
use App\Http\Controllers\Api\BookingController as CustomerBookingController;
use App\Http\Controllers\Api\Staff\TicketController;
use App\Http\Controllers\Api\Staff\StaffController;

Route::apiResource(
    'movie-categories',
    MovieCategoryController::class
)->only(['index', 'show']);

Route::prefix('auth')->group(function () {

    Route::post('/register', [AuthController::class, 'register']);

    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);

    Route::post('/forgot-password', [
        AuthController::class,
        'forgotPassword'
    ]);

    Route::post('/reset-password', [
        AuthController::class,
        'resetPassword'
    ]);

    Route::middleware('web')->group(function () {
        Route::get('/google', [
            AuthController::class,
            'googleRedirect'
        ]);

        Route::get('/google/callback', [
            AuthController::class,
            'googleCallback'
        ]);
    });

    Route::middleware('auth:sanctum')->group(function () {

        Route::get('/user', [
            AuthController::class,
            'user'
        ]);

        Route::post('/logout', [
            AuthController::class,
            'logout'
        ]);
    });
});

// Public movie browsing
Route::get('/showtimes', [PublicShowtimeController::class, 'index']);
Route::get('/showtimes/{showtime}', [PublicShowtimeController::class, 'show']);
Route::get('/showtimes/{showtime}/seats', [PublicShowtimeController::class, 'seats']);

// Customer booking flow (authenticated)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/my-bookings', [CustomerBookingController::class, 'myBookings']);
    Route::post('/bookings', [CustomerBookingController::class, 'store']);
    Route::post('/bookings/{booking}/cancel', [CustomerBookingController::class, 'cancel']);
});

// Staff
Route::middleware('auth:sanctum')->prefix('staff')->group(function () {
    Route::get('/tickets/search', [TicketController::class, 'search']);
    Route::post('/tickets/{ticket}/check-in', [TicketController::class, 'checkin']);
    Route::post('/sell-ticket', [StaffController::class, 'sell']);
    Route::get('/showtimes', [StaffController::class, 'showtimes']);
    Route::get('/rooms', [StaffController::class, 'rooms']);
    Route::get('/rooms/{room}', [StaffController::class, 'room']);
});

// Admin
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::apiResource('movies', MovieController::class);
    Route::apiResource('cinemas', CinemaController::class);
    Route::apiResource('rooms', RoomController::class);
    Route::get('seats', [SeatController::class, 'index']);
    Route::post('seats', [SeatController::class, 'store']);
    Route::post('seats/bulk', [SeatController::class, 'bulk']);
    Route::delete('seats/clear', [SeatController::class, 'clear']);
    Route::put('seats/{seat}', [SeatController::class, 'update']);
    Route::delete('seats/{seat}', [SeatController::class, 'destroy']);
    Route::apiResource('showtimes', ShowtimeController::class);
    Route::get('bookings', [BookingController::class, 'index']);
    Route::get('bookings/{booking}', [BookingController::class, 'show']);
    Route::delete('bookings/{booking}', [BookingController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/movie-categories', [MovieCategoryController::class, 'store']);
    Route::put('/movie-categories/{movie_category}', [MovieCategoryController::class, 'update']);
    Route::delete('/movie-categories/{movie_category}', [MovieCategoryController::class, 'destroy']);

});

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::apiResource('users', UserController::class)->except(['create', 'edit']);
});