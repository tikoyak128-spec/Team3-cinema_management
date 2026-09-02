<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status');

        $query = Booking::with([
            'user',
            'showtime.movie',
            'showtime.room.cinema',
            'seats',
            'tickets',
        ])->latest();

        if ($request->filled('status')) {
            $query->where('status', $status);
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate(15),
        ]);
    }

    public function show(Booking $booking)
    {
        $booking->load([
            'user',
            'showtime.movie',
            'showtime.room.cinema',
            'seats',
            'tickets',
        ]);

        return response()->json([
            'success' => true,
            'data' => $booking,
        ]);
    }

    public function destroy(Booking $booking)
    {
        $booking->delete();

        return response()->json([
            'success' => true,
            'message' => 'Booking deleted successfully',
        ]);
    }
}