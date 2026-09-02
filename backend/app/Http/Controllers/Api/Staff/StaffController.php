<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingSeat;
use App\Models\Payment;
use App\Models\Room;
use App\Models\Seat;
use App\Models\Showtime;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class StaffController extends Controller
{
    // Walk-in customer used when no email is provided at the counter
    const WALKIN_EMAIL = 'walkin@cinema.local';
    const WALKIN_NAME = 'Walk-in Customer';

    // SELL A TICKET at the counter (customer may be existing or walk-in)
    public function sell(Request $request)
    {
        $request->validate([
            'showtime_id' => ['required', 'exists:showtimes,id'],
            'seat_ids' => ['required', 'array', 'min:1'],
            'seat_ids.*' => ['integer', 'exists:seats,id'],
            'payment_method' => ['nullable', 'string', 'in:card,cash'],
            'customer_email' => ['nullable', 'email'],
            'customer_name' => ['nullable', 'string', 'max:255'],
        ]);

        $showtime = Showtime::findOrFail($request->showtime_id);

        if ($showtime->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'This showtime is not available for sale.',
            ], 422);
        }

        $seatIds = array_values(array_unique($request->seat_ids));

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
                'message' => 'One or more seats are already booked.',
            ], 422);
        }

        // Resolve the customer (existing by email, new customer, or walk-in)
        $customer = $this->resolveCustomer(
            $request->customer_email,
            $request->customer_name
        );

        $seats = Seat::whereIn('id', $seatIds)->get();

        $totalAmount = $seats->sum(function ($seat) use ($showtime) {
            $price = (float) $showtime->price;
            if ($seat->seat_type === 'vip') {
                $price += 2.00;
            }
            return $price;
        });

        $booking = Booking::create([
            'user_id' => $customer->id,
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
            'payment_method' => $request->payment_method ?? 'cash',
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        $booking->load([
            'user',
            'showtime.movie.category',
            'showtime.room.cinema',
            'seats',
            'tickets',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ticket sold successfully.',
            'data' => $booking,
        ], 201);
    }

    // All showtimes (with room & cinema) for staff to check
    public function showtimes()
    {
        $showtimes = Showtime::with(['movie', 'room.cinema'])
            ->withCount('bookings')
            ->latest('start_time')
            ->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $showtimes,
        ]);
    }

    // All rooms (with cinema + seat count) for staff to check
    public function rooms()
    {
        $rooms = Room::with('cinema')->withCount('seats')->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $rooms,
        ]);
    }

    // Room detail including its seats
    public function room(Room $room)
    {
        $room->load('cinema');

        $seats = Seat::where('cinema_room_id', $room->id)
            ->orderBy('row')
            ->orderBy('seat_number')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'room' => $room,
                'seats' => $seats,
            ],
        ]);
    }

    protected function resolveCustomer(?string $email, ?string $name): User
    {
        $email = trim((string) $email);

        if ($email !== '') {
            $user = User::where('email', $email)->first();

            if ($user) {
                return $user;
            }

            return User::create([
                'name' => trim((string) $name) ?: strstr($email, '@', true) ?: $email,
                'email' => $email,
                'password' => Hash::make(Str::random(16)),
                'phone' => null,
                'google_id' => null,
                'auth_provider' => 'email',
                'role' => 'customer',
            ]);
        }

        // Walk-in sale -> reusable guest account
        $walkin = User::where('email', self::WALKIN_EMAIL)->first();

        if ($walkin) {
            return $walkin;
        }

        return User::create([
            'name' => self::WALKIN_NAME,
            'email' => self::WALKIN_EMAIL,
            'password' => Hash::make(Str::random(16)),
            'phone' => null,
            'google_id' => null,
            'auth_provider' => 'email',
            'role' => 'customer',
        ]);
    }
}