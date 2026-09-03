<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingSeat;
use App\Models\Seat;
use App\Models\Showtime;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    public function index(): JsonResponse
    {
        $bookings = Booking::with([
            'user',
            'showtime.movie',
            'showtime.room.cinema',
            'bookingSeats.seat',
            'tickets',
        ])->get();

        return response()->json($bookings);
    }

    public function show(int $id): JsonResponse
    {
        $booking = Booking::with([
            'user',
            'showtime.movie',
            'showtime.room.cinema',
            'bookingSeats.seat',
            'tickets',
        ])->find($id);

        if (!$booking) {
            return response()->json([
                'message' => 'Booking not found'
            ], 404);
        }

        return response()->json($booking);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => [
                'required',
                'integer',
                'exists:users,id'
            ],
            'showtime_id' => [
                'required',
                'integer',
                'exists:showtimes,id'
            ],
            'seat_ids' => [
                'required',
                'array',
                'min:1'
            ],
            'seat_ids.*' => [
                'integer',
                'exists:seats,id'
            ],
        ]);

        $showtime = Showtime::with('room')->findOrFail($validated['showtime_id']);
        $room = $showtime->room;

        $seats = Seat::whereIn('id', $validated['seat_ids'])->get();

        if ($seats->count() !== count($validated['seat_ids'])) {
            return response()->json([
                'message' => 'One or more seats do not exist'
            ], 422);
        }

        $wrongRoom = $seats->where('room_id', '!=', $room->id)->isNotEmpty();

        if ($wrongRoom) {
            return response()->json([
                'message' => 'One or more seats do not belong to the showtime\'s room'
            ], 422);
        }

        $alreadyBooked = BookingSeat::where('status', '!=', 'cancelled')
            ->whereHas('booking', function ($query) use ($showtime) {
                $query->where('showtime_id', $showtime->id)
                    ->where('status', '!=', 'cancelled');
            })
            ->whereIn('seat_id', $validated['seat_ids'])
            ->pluck('seat_id');

        if ($alreadyBooked->isNotEmpty()) {
            return response()->json([
                'message' => 'Some seats are already booked for this showtime',
                'booked_seat_ids' => $alreadyBooked->toArray()
            ], 422);
        }

        $totalAmount = $showtime->price * count($seats);

        return DB::transaction(function () use ($validated, $showtime, $seats, $totalAmount) {

            $booking = Booking::create([
                'user_id' => $validated['user_id'],
                'showtime_id' => $validated['showtime_id'],
                'total_amount' => $totalAmount,
                'status' => 'confirmed',
            ]);

            $tickets = [];

            foreach ($seats as $seat) {
                $ticketCode = strtoupper(Str::random(8));

                BookingSeat::create([
                    'booking_id' => $booking->id,
                    'seat_id' => $seat->id,
                    'ticket_code' => $ticketCode,
                    'status' => 'valid',
                ]);

                $tickets[] = [
                    'booking_id' => $booking->id,
                    'ticket_code' => $ticketCode,
                    'price' => $showtime->price,
                    'seat_number' => $seat->seat_number,
                    'status' => 'valid',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            Ticket::insert($tickets);

            return response()->json(
                $booking->load([
                    'user',
                    'showtime.movie',
                    'showtime.room.cinema',
                    'bookingSeats.seat',
                    'tickets',
                ]),
                201
            );
        });
    }
}
