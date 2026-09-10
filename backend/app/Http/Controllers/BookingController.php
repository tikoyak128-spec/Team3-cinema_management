<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingSeat;
use App\Models\Seat;
use App\Models\Showtime;
use App\Models\Ticket;
use App\Services\BakongService;
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

        if (! $booking) {
            return response()->json([
                'message' => 'Booking not found',
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
                'exists:users,id',
            ],
            'showtime_id' => [
                'required',
                'integer',
                'exists:showtimes,id',
            ],
            'seat_ids' => [
                'required',
                'array',
                'min:1',
            ],
            'seat_ids.*' => [
                'integer',
                'exists:seats,id',
            ],
        ]);

        $showtime = Showtime::with('room')->findOrFail($validated['showtime_id']);
        $room = $showtime->room;

        $seats = Seat::whereIn('id', $validated['seat_ids'])->get();

        if ($seats->count() !== count($validated['seat_ids'])) {
            return response()->json([
                'message' => 'One or more seats do not exist',
            ], 422);
        }

        $wrongRoom = $seats->where('cinema_room_id', '!=', $room->id)->isNotEmpty();

        if ($wrongRoom) {
            return response()->json([
                'message' => 'One or more seats do not belong to the showtime\'s room',
            ], 422);
        }

        $alreadyBooked = BookingSeat::whereIn('seat_id', $validated['seat_ids'])
            ->whereHas('booking', function ($query) use ($showtime) {
                $query->where('showtime_id', $showtime->id)
                    ->whereIn('status', ['pending', 'confirmed'])
                    ->where(function ($q) {
                        $q->where('status', '!=', 'pending')
                            ->orWhereNull('payment_expires_at')
                            ->orWhere('payment_expires_at', '>', now());
                    });
            })
            ->pluck('seat_id');

        if ($alreadyBooked->isNotEmpty()) {
            return response()->json([
                'message' => 'Some seats are already booked for this showtime',
                'booked_seat_ids' => $alreadyBooked->toArray(),
            ], 422);
        }

        $totalAmount = $showtime->price * count($seats);

        return DB::transaction(function () use ($validated, $showtime, $seats, $totalAmount) {

            $bookingCode = 'BK-' . strtoupper(Str::random(10));

            $booking = Booking::create([
                'user_id' => $validated['user_id'],
                'showtime_id' => $validated['showtime_id'],
                'booking_code' => $bookingCode,
                'total_amount' => $totalAmount,
                'status' => 'pending',
            ]);

            foreach ($seats as $seat) {
                BookingSeat::create([
                    'booking_id' => $booking->id,
                    'seat_id' => $seat->id,
                    'price' => $showtime->price,
                ]);
            }

            $bakong = app(BakongService::class);

            try {
                $qrData = $bakong->generateKhrq($totalAmount, $bookingCode);
            } catch (\Throwable $e) {
                BookingSeat::where('booking_id', $booking->id)->delete();
                $booking->delete();

                return response()->json([
                    'message' => 'Could not create payment code: '.$e->getMessage(),
                ], 500);
            }

            $expiresAt = $qrData['expirationTimestamp']
                ? now()->setTimestamp((int) round(((int) $qrData['expirationTimestamp']) / 1000))
                : now()->addMinutes(10);

            $booking->update([
                'payment_md5' => $qrData['md5'],
                'payment_qr' => $qrData['qr'],
                'payment_expires_at' => $expiresAt,
            ]);

            return response()->json(
                array_merge($booking->load([
                    'user',
                    'showtime.movie',
                    'showtime.room.cinema',
                    'bookingSeats.seat',
                    'tickets',
                ])->toArray(), [
                    'payment' => [
                        'qr' => $qrData['qr'],
                        'md5' => $qrData['md5'],
                        'amount' => $totalAmount,
                        'currency' => config('services.bakong.currency'),
                        'expires_at' => $expiresAt->toIso8601String(),
                    ],
                ]),
                201
            );
        });
    }

    public function checkPayment(Request $request, int $id): JsonResponse
    {
        $booking = Booking::with([
            'user',
            'showtime.movie',
            'showtime.room.cinema',
            'bookingSeats.seat',
            'tickets',
        ])->find($id);

        if (! $booking) {
            return response()->json([
                'message' => 'Booking not found',
            ], 404);
        }

        if ($booking->status === 'confirmed') {
            return $this->paymentResponse($booking, 'confirmed', 'Payment already confirmed.');
        }

        if ($booking->status === 'cancelled') {
            return response()->json([
                'message' => 'Booking is cancelled',
            ], 422);
        }

        if (! $booking->payment_md5) {
            return response()->json([
                'message' => 'No payment generated for this booking',
            ], 422);
        }

        $bakong = app(BakongService::class);
        $result = $bakong->checkTransactionByMd5($booking->payment_md5);

        if (! $bakong->isPaid($result)) {
            return $this->paymentResponse($booking, 'pending', $result['responseMessage'] ?? 'Payment not completed yet.');
        }

        $transactionData = $result['data'] ?? [];

        return DB::transaction(function () use ($booking, $transactionData) {
            if ($booking->status !== 'confirmed') {
                $booking->update([
                    'status' => 'confirmed',
                    'paid_at' => now(),
                ]);

                foreach ($booking->bookingSeats as $bs) {
                    Ticket::create([
                        'booking_id' => $booking->id,
                        'booking_seat_id' => $bs->id,
                        'ticket_code' => strtoupper(Str::random(8)),
                        'status' => 'valid',
                    ]);
                }
            }

            return $this->paymentResponse($booking, 'confirmed', 'Payment completed successfully.', $transactionData);
        });
    }

    private function paymentResponse(
        Booking $booking,
        string $paymentStatus,
        string $message,
        array $transactionData = []
    ): JsonResponse {
        return response()->json([
            'booking_id' => $booking->id,
            'booking_status' => $booking->status,
            'payment_status' => $paymentStatus,
            'message' => $message,
            'transaction' => $transactionData,
            'booking' => $booking->load([
                'user',
                'showtime.movie',
                'showtime.room.cinema',
                'bookingSeats.seat',
                'tickets',
            ]),
        ]);
    }
}
