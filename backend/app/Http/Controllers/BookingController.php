<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingSeat;
use App\Models\Discount;
use App\Models\Promotion;
use App\Models\Seat;
use App\Models\Showtime;
use App\Models\Ticket;
use App\Models\User;
use App\Services\BakongService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    public function index(): JsonResponse
    {
        $bookings = Booking::with([
            'user',
            'promotion',
                    'discount',
            'showtime.movie',
            'showtime.room.cinema',
            'bookingSeats.seat',
            'tickets',
        ])->get();

        return response()->json($bookings);
    }

    public function myBookings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string', 'in:all,upcoming,past,pending,confirmed,cancelled'],
        ]);

        $query = Booking::with([
            'user',
            'promotion',
                    'discount',
            'showtime.movie',
            'showtime.room.cinema',
            'bookingSeats.seat',
            'tickets',
        ])->where('user_id', $request->user()->id);

        switch ($validated['status'] ?? 'all') {
            case 'upcoming':
                $query->where('status', 'confirmed')
                    ->whereHas('showtime', fn ($q) => $q->where('start_time', '>=', now()));
                break;
            case 'past':
                $query->where(function ($q) {
                    $q->whereHas('showtime', fn ($sub) => $sub->where('start_time', '<', now()))
                        ->orWhere('status', 'cancelled');
                });
                break;
            case 'pending':
                $query->where('status', 'pending');
                break;
            case 'confirmed':
                $query->where('status', 'confirmed');
                break;
            case 'cancelled':
                $query->where('status', 'cancelled');
                break;
        }

        $bookings = $query->orderByDesc('created_at')->get();

        return response()->json($bookings);
    }

    public function show(int $id): JsonResponse
    {
        $booking = Booking::with([
            'user',
            'promotion',
                    'discount',
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
            'promotion_id' => [
                'nullable',
                'integer',
                'exists:promotions,id',
            ],
            'discount_code' => [
                'nullable',
                'string',
                'max:255',
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

        $subtotal = $showtime->price * count($seats);
        [$promotionId, $promoDiscount, $totalAmount] = $this->applyPromotion(
            $validated['promotion_id'] ?? null,
            $subtotal
        );
        [$discountId, $codeDiscount, $totalAmount] = $this->applyDiscountCode(
            $validated['discount_code'] ?? null,
            $subtotal,
            $totalAmount
        );
        $discountAmount = round($promoDiscount + $codeDiscount, 2);

        return DB::transaction(function () use ($validated, $showtime, $seats, $totalAmount, $promotionId, $discountId, $discountAmount) {

            $bookingCode = 'BK-'.strtoupper(Str::random(10));

            $booking = Booking::create([
                'user_id' => $validated['user_id'],
                'showtime_id' => $validated['showtime_id'],
                'promotion_id' => $promotionId,
                'discount_id' => $discountId,
                'booking_code' => $bookingCode,
                'total_amount' => $totalAmount,
                'discount_amount' => $discountAmount > 0 ? $discountAmount : null,
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
                    'promotion',
                    'discount',
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

    public function searchByCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:255'],
        ]);

        $code = strtoupper(trim($validated['code']));

        $bookings = Booking::with([
            'user',
            'promotion',
                    'discount',
            'showtime.movie',
            'showtime.room.cinema',
            'bookingSeats.seat',
            'tickets',
        ])
            ->where(function ($query) use ($code) {
                $query->where('booking_code', 'LIKE', '%'.$code.'%')
                    ->orWhereHas('tickets', fn ($q) => $q->where('ticket_code', 'LIKE', '%'.$code.'%'));
            })
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        return response()->json($bookings);
    }

    public function storeStaff(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'showtime_id' => ['required', 'integer', 'exists:showtimes,id'],
            'seat_ids' => ['required', 'array', 'min:1'],
            'seat_ids.*' => ['integer', 'exists:seats,id'],
            'customer_name' => ['nullable', 'string', 'max:255'],
            'customer_email' => ['nullable', 'string', 'email', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:20'],
            'payment_method' => ['nullable', 'string', 'in:cash,bakong'],
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
                    ->whereIn('status', ['pending', 'confirmed']);
            })
            ->pluck('seat_id');

        if ($alreadyBooked->isNotEmpty()) {
            return response()->json([
                'message' => 'Some seats are already booked for this showtime',
                'booked_seat_ids' => $alreadyBooked->toArray(),
            ], 422);
        }

        $totalAmount = $showtime->price * count($seats);

        $buyer = null;
        if (! empty($validated['customer_email'])) {
            $buyer = User::where('email', $validated['customer_email'])->first();
        }

        return DB::transaction(function () use ($validated, $showtime, $seats, $totalAmount, $request, $buyer) {

            $user = $buyer ?? $request->user();

            $bookingCode = 'BK-'.strtoupper(Str::random(10));

            $isBakong = ($validated['payment_method'] ?? 'cash') === 'bakong';

            $booking = Booking::create([
                'user_id' => $user->id,
                'showtime_id' => $validated['showtime_id'],
                'booking_code' => $bookingCode,
                'total_amount' => $totalAmount,
                'payment_method' => $isBakong ? 'bakong' : 'cash',
                'status' => $isBakong ? 'pending' : 'confirmed',
                'paid_at' => $isBakong ? null : now(),
            ]);

            foreach ($seats as $seat) {
                BookingSeat::create([
                    'booking_id' => $booking->id,
                    'seat_id' => $seat->id,
                    'price' => $showtime->price,
                ]);
            }

            if ($isBakong) {
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
                        'promotion',
                    'discount',
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
            }

            foreach ($seats as $seat) {
                $bookingSeat = BookingSeat::where('booking_id', $booking->id)
                    ->where('seat_id', $seat->id)
                    ->firstOrFail();

                Ticket::create([
                    'booking_id' => $booking->id,
                    'booking_seat_id' => $bookingSeat->id,
                    'ticket_code' => strtoupper(Str::random(8)),
                    'status' => 'valid',
                ]);
            }

            return response()->json(
                $booking->load([
                    'user',
                    'promotion',
                    'discount',
                    'showtime.movie',
                    'showtime.room.cinema',
                    'bookingSeats.seat',
                    'tickets',
                ]),
                201
            );
        });
    }

    public function checkPayment(Request $request, int $id): JsonResponse
    {
        $booking = Booking::with([
            'user',
            'promotion',
                    'discount',
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
            $verificationError = $bakong->hasError($result);

            $message = $result['responseMessage'] ?? 'Payment not completed yet.';

            if ($verificationError) {
                $message = 'Could not verify payment automatically ('.$message.'). Please wait — a staff member can confirm your payment at the counter.';
            } elseif ($bakong->isNotFound($result)) {
                $message = 'Payment not found in Bakong yet. Keep this page open — it checks automatically and issues your ticket as soon as Bakong confirms the payment.';
            }

            return $this->paymentResponse($booking, 'pending', $message, [], $verificationError);
        }

        if (! $bakong->amountMatches($result, (float) $booking->total_amount)) {
            return $this->paymentResponse(
                $booking,
                'pending',
                'A payment was found, but the amount does not match this booking.',
                $result['data'] ?? []
            );
        }

        $transactionData = $result['data'] ?? [];

        return DB::transaction(function () use ($booking, $transactionData) {
            if ($booking->status !== 'confirmed') {
                $booking->update([
                    'status' => 'confirmed',
                    'paid_at' => now(),
                ]);

                foreach ($booking->bookingSeats as $bs) {
                    Ticket::firstOrCreate(
                        [
                            'booking_id' => $booking->id,
                            'booking_seat_id' => $bs->id,
                        ],
                        [
                            'ticket_code' => strtoupper(Str::random(8)),
                            'status' => 'valid',
                        ]
                    );
                }
            }

            return $this->paymentResponse($booking, 'confirmed', 'Payment completed successfully.', $transactionData);
        });
    }

    /**
     * Regenerate the Bakong QR code for a pending booking so the customer can
     * continue an unfinished payment after the previous QR expired.
     */
    public function refreshPayment(Request $request, int $id): JsonResponse
    {
        $booking = Booking::with(['showtime', 'bookingSeats'])->find($id);

        if (! $booking) {
            return response()->json([
                'message' => 'Booking not found',
            ], 404);
        }

        $user = $request->user();
        $isStaff = in_array($user->role ?? '', ['admin', 'staff'], true);

        if (! $isStaff && (int) $booking->user_id !== (int) $user->id) {
            return response()->json([
                'message' => 'Booking not found',
            ], 404);
        }

        if ($booking->status === 'confirmed') {
            return response()->json([
                'message' => 'Payment already confirmed.',
            ], 422);
        }

        if ($booking->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending bookings can be paid.',
            ], 422);
        }

        if (! $booking->showtime || Carbon::parse($booking->showtime->start_time) <= now()) {
            return response()->json([
                'message' => 'This showtime has already started.',
            ], 422);
        }

        $bakong = app(BakongService::class);

        // Before generating a new code, re-check the current one: if the
        // customer already paid (e.g. before the QR expired), confirm it
        // automatically instead of discarding that payment with a fresh code.
        if ($booking->payment_md5) {
            $existing = $bakong->checkTransactionByMd5($booking->payment_md5);

            if ($bakong->isPaid($existing) && $bakong->amountMatches($existing, (float) $booking->total_amount)) {
                $booking = DB::transaction(function () use ($booking, $existing) {
                    if ($booking->status !== 'confirmed') {
                        $booking->update([
                            'status' => 'confirmed',
                            'paid_at' => now(),
                        ]);

                        foreach ($booking->bookingSeats as $bs) {
                            Ticket::firstOrCreate(
                                [
                                    'booking_id' => $booking->id,
                                    'booking_seat_id' => $bs->id,
                                ],
                                [
                                    'ticket_code' => strtoupper(Str::random(8)),
                                    'status' => 'valid',
                                ]
                            );
                        }
                    }

                    return $booking;
                });

                return $this->paymentResponse(
                    $booking,
                    'confirmed',
                    'Payment completed successfully. Enjoy your movie!',
                    $existing['data'] ?? []
                );
            }

            if ($bakong->hasError($existing)) {
                return response()->json([
                    'message' => 'A payment verification is already in progress. Please check the payment status.',
                ], 422);
            }
        }

        $seatIds = $booking->bookingSeats->pluck('seat_id');

        $taken = BookingSeat::whereIn('seat_id', $seatIds)
            ->where('booking_id', '!=', $booking->id)
            ->whereHas('booking', function ($query) use ($booking) {
                $query->where('showtime_id', $booking->showtime_id)
                    ->whereIn('status', ['pending', 'confirmed'])
                    ->where(function ($q) {
                        $q->where('status', '!=', 'pending')
                            ->orWhereNull('payment_expires_at')
                            ->orWhere('payment_expires_at', '>', now());
                    });
            })
            ->exists();

        if ($taken) {
            return response()->json([
                'message' => 'Your seats are no longer available. Please cancel this booking and choose seats again.',
            ], 409);
        }

        $bakong = app(BakongService::class);

        try {
            $qrData = $bakong->generateKhrq((float) $booking->total_amount, $booking->booking_code);
        } catch (\Throwable $e) {
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

        return response()->json([
            'payment' => [
                'qr' => $qrData['qr'],
                'md5' => $qrData['md5'],
                'amount' => (float) $booking->total_amount,
                'currency' => config('services.bakong.currency'),
                'expires_at' => $expiresAt->toIso8601String(),
            ],
        ]);
    }

    /**
     * Manually confirm a pending booking as paid and generate its tickets.
     *
     * Staff-only. This fallback is used when Bakong automatic verification is
     * unavailable (e.g. daily API limit reached) or when staff accepts the
     * payment at the counter. Customers cannot self-confirm — tickets are only
     * issued once payment is verified by Bakong.
     */
    public function confirmPayment(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role ?? '', ['staff', 'admin'], true)) {
            return response()->json([
                'message' => 'Only staff can confirm a payment',
            ], 403);
        }

        $booking = Booking::with([
            'user',
            'promotion',
                    'discount',
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

        $booking = DB::transaction(function () use ($booking) {
            if ($booking->status !== 'confirmed') {
                $booking->update([
                    'status' => 'confirmed',
                    'paid_at' => now(),
                ]);

                foreach ($booking->bookingSeats as $bs) {
                    Ticket::firstOrCreate(
                        [
                            'booking_id' => $booking->id,
                            'booking_seat_id' => $bs->id,
                        ],
                        [
                            'ticket_code' => strtoupper(Str::random(8)),
                            'status' => 'valid',
                        ]
                    );
                }
            }

            return $booking;
        });

        return $this->paymentResponse($booking, 'confirmed', 'Payment confirmed. Enjoy your movie!');
    }

    public function cancel(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $isStaff = in_array($user->role ?? '', ['admin', 'staff'], true);

        $booking = Booking::with([
            'user',
            'promotion',
                    'discount',
            'showtime',
            'bookingSeats.seat',
            'tickets',
        ])->find($id);

        if (! $booking) {
            return response()->json([
                'message' => 'Booking not found',
            ], 404);
        }

        if (! $isStaff && $booking->user_id !== $user->id) {
            return response()->json([
                'message' => 'You do not own this booking',
            ], 403);
        }

        if ($booking->status === 'cancelled') {
            return response()->json([
                'message' => 'Booking is already cancelled',
            ], 422);
        }

        if (! $isStaff && $booking->showtime && Carbon::parse($booking->showtime->start_time) <= now()) {
            return response()->json([
                'message' => 'Cannot cancel a booking after the showtime has started',
            ], 422);
        }

        return DB::transaction(function () use ($booking) {
            $booking->update(['status' => 'cancelled']);
            $booking->tickets()->update(['status' => 'cancelled']);

            return response()->json([
                'message' => 'Booking cancelled successfully',
                'booking' => $booking->load([
                    'user',
                    'promotion',
                    'discount',
                    'showtime.movie',
                    'showtime.room.cinema',
                    'bookingSeats.seat',
                    'tickets',
                ]),
            ]);
        });
    }

    private function applyPromotion(?int $promotionId, float $subtotal): array
    {
        if (! $promotionId) {
            return [null, 0.0, $subtotal];
        }

        $promo = Promotion::where('id', $promotionId)
            ->where('is_active', true)
            ->first();

        if (! $promo || ! in_array($promo->type, ['tickets', 'combo'], true)) {
            return [null, 0.0, $subtotal];
        }

        $percent = (int) preg_replace('/[^0-9]/', '', (string) $promo->discount);

        if ($percent <= 0 || $percent > 100) {
            return [null, 0.0, $subtotal];
        }

        $discount = round($subtotal * $percent / 100, 2);
        $total = round($subtotal - $discount, 2);

        return [$promo->id, $discount, $total];
    }

    private function applyDiscountCode(?string $code, float $subtotal, float $total): array
    {
        if (! $code) {
            return [null, 0.0, $total];
        }

        $discount = Discount::where('code', strtoupper(trim($code)))
            ->where('is_active', true)
            ->first();

        if (! $discount) {
            return [null, 0.0, $total];
        }

        if ($discount->starts_at && $discount->starts_at->isFuture()) {
            return [null, 0.0, $total];
        }

        if ($discount->ends_at && $discount->ends_at->isPast()) {
            return [null, 0.0, $total];
        }

        if ($discount->min_amount !== null && $subtotal < (float) $discount->min_amount) {
            return [null, 0.0, $total];
        }

        $amount = $discount->type === 'fixed'
            ? (float) $discount->value
            : round($subtotal * (float) $discount->value / 100, 2);

        if ($discount->max_discount !== null) {
            $amount = min($amount, (float) $discount->max_discount);
        }

        $amount = round($amount, 2);

        if ($amount <= 0 || $amount >= $total) {
            return [null, 0.0, $total];
        }

        $newTotal = round($total - $amount, 2);

        return [$discount->id, $amount, $newTotal];
    }

    private function paymentResponse(
        Booking $booking,
        string $paymentStatus,
        string $message,
        array $transactionData = [],
        bool $verificationError = false
    ): JsonResponse {
        return response()->json([
            'booking_id' => $booking->id,
            'booking_status' => $booking->status,
            'payment_status' => $paymentStatus,
            'message' => $message,
            'verification_error' => $verificationError,
            'transaction' => $transactionData,
            'payment' => [
                'qr' => $booking->payment_qr,
                'md5' => $booking->payment_md5,
                'amount' => (float) $booking->total_amount,
                'currency' => config('services.bakong.currency'),
                'expires_at' => $booking->payment_expires_at
                    ? Carbon::parse($booking->payment_expires_at)->toIso8601String()
                    : null,
            ],
            'booking' => $booking->load([
                'user',
                'promotion',
                    'discount',
                'showtime.movie',
                'showtime.room.cinema',
                'bookingSeats.seat',
                'tickets',
            ]),
        ]);
    }
}
