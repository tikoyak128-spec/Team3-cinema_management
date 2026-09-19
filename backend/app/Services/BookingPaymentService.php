<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Ticket;
use Illuminate\Support\Str;

class BookingPaymentService
{
    public function confirm(Booking $booking): Booking
    {
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
    }
}
