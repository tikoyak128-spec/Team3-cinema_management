<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingSeat;
use App\Models\Payment;
use App\Models\Seat;
use App\Models\Showtime;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    public function myBookings(Request $request)
    {
        $bookings = Booking::with([
            'showtime.movie.category',
            'showtime.room.cinema',
            'seats',
            'tickets',
        ])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(15);

        // Mark bookings that can still be cancelled (at least 1h before start)
        $bookings->getCollection()->each(function ($booking) {
            $booking->setAttribute(
                'is_cancellable',
                $booking->status === 'confirmed'
                    && optional($booking->showtime)->start_time > now()->addHour()
            );
        });

        return response()->json([
            'success' => true,
            'data' => $bookings,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'showtime_id' => ['required', 'exists:showtimes,id'],
            'seat_ids' => ['required', 'array', 'min:1'],
            'seat_ids.*' => ['integer', 'exists:seats,id'],
            'payment_method' => ['nullable', 'string', 'in:card,cash'],
        ]);

        $showtime = Showtime::findOrFail($request->showtime_id);

        if ($showtime->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'This showtime is not available for booking.',
            ], 422);
        }

        $seatIds = array_values(array_unique($request->seat_ids));

        // All seats must belong to this showtime's room
        $seatCount = Seat::whereIn('id', $seatIds)
            ->where('cinema_room_id', $showtime->cinema_room_id)
            ->count();

        if ($seatCount !== count($seatIds)) {
            return response()->json([
                'success' => false,
                'message' => 'One or more selected seats are not in this room.',
            ], 422);
        }

        // Prevent double booking
        $alreadyBooked = Booking::where('showtime_id', $showtime->id)
            ->where('status', '!=', 'cancelled')
            ->get()
            ->flatMap(fn ($booking) => $booking->bookingSeats->pluck('seat_id'))
            ->unique();

        $conflicts = collect($seatIds)->filter(fn ($id) => $alreadyBooked->contains($id));

        if ($conflicts->isNotEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'One or more seats have already been booked.',
            ], 422);
        }

        $seats = Seat::whereIn('id', $seatIds)->get();

        $totalAmount = $seats->sum(function ($seat) use ($showtime) {
            $price = (float) $showtime->price;
            if ($seat->seat_type === 'vip') {
                $price += 2.00;
            }
            return $price;
        });

        $booking = Booking::create([
            'user_id' => $request->user()->id,
            'showtime_id' => $showtime->id,
            'booking_code' => 'BK-' . strtoupper(Str::random(8)),
            'total_amount' => $totalAmount,
            'status' => 'confirmed',
        ]);

        foreach ($seats as $seat) {
            $price = (float) $showtime->price;
            if ($seat->seat_type === 'vip') {
                $price += 2.00;
            }

            $bookingSeat = BookingSeat::create([
                'booking_id' => $booking->id,
                'seat_id' => $seat->id,
                'price' => $price,
            ]);

            Ticket::create([
                'booking_id' => $booking->id,
                'booking_seat_id' => $bookingSeat->id,
                'ticket_code' => 'TK-' . strtoupper(Str::random(8)),
                'status' => 'valid',
            ]);
        }

        Payment::create([
            'booking_id' => $booking->id,
            'payment_code' => 'PAY-' . strtoupper(Str::random(8)),
            'amount' => $totalAmount,
            'payment_method' => $request->payment_method ?? 'card',
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        $booking->load([
            'showtime.movie.category',
            'showtime.room.cinema',
            'seats',
            'tickets',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Booking created successfully',
            'data' => $booking,
        ], 201);
    }

    public function cancel(Request $request, Booking $booking)
    {
        // Only the owner can cancel
        if ($booking->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot cancel someone else\'s booking.',
            ], 403);
        }

        if ($booking->status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'This booking is already cancelled.',
            ], 422);
        }

        // Can only cancel at least 1 hour before the movie starts
        if ($booking->showtime->start_time <= now()->addHour()) {
            return response()->json([
                'success' => false,
                'message' => 'Bookings can only be cancelled at least 1 hour before the show starts.',
            ], 422);
        }

        // Cancel the booking
        $booking->update(['status' => 'cancelled']);

        // Invalidate its tickets
        Ticket::where('booking_id', $booking->id)
            ->where('status', 'valid')
            ->update(['status' => 'cancelled']);

        // Refund the payment
        Payment::where('booking_id', $booking->id)
            ->where('status', 'paid')
            ->update(['status' => 'refunded']);

        $booking->load(['showtime.movie.category', 'showtime.room.cinema', 'seats', 'tickets']);

        return response()->json([
            'success' => true,
            'message' => 'Booking cancelled successfully.',
            'data' => $booking,
        ]);
    }
}