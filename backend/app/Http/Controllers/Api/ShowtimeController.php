<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Seat;
use App\Models\Showtime;

class ShowtimeController extends Controller
{
    public function index()
    {
        $showtimes = Showtime::with([
            'movie.category',
            'room.cinema',
        ])
            ->where('status', 'active')
            ->where('start_time', '>=', now()->subHours(2))
            ->latest('start_time')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $showtimes,
        ]);
    }

    public function show(Showtime $showtime)
    {
        $showtime->load('movie.category', 'room.cinema');

        return response()->json([
            'success' => true,
            'data' => $showtime,
        ]);
    }

    public function seats(Showtime $showtime)
    {
        if ($showtime->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'This showtime is not available.',
            ], 422);
        }

        $seats = Seat::where('cinema_room_id', $showtime->cinema_room_id)
            ->orderBy('row')
            ->orderBy('seat_number')
            ->get();

        // Seats already booked for this showtime
        $bookedSeatIds = Booking::where('showtime_id', $showtime->id)
            ->where('status', '!=', 'cancelled')
            ->get()
            ->flatMap(fn ($booking) => $booking->bookingSeats->pluck('seat_id'))
            ->unique()
            ->values();

        $seats->each(function ($seat) use ($bookedSeatIds) {
            $seat->is_booked = $bookedSeatIds->contains($seat->id);
        });

        return response()->json([
            'success' => true,
            'data' => [
                'showtime' => $showtime->load('movie', 'room.cinema'),
                'seats' => $seats,
            ],
        ]);
    }
}