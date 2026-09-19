<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Services\BakongService;
use App\Services\BookingPaymentService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class VerifyPendingBakongPayments extends Command
{
    protected $signature = 'bakong:verify-pending {--limit=30}';

    protected $description = 'Verify pending Bakong payments and issue tickets once paid';

    public function handle(BakongService $bakong, BookingPaymentService $payments): int
    {
        $limit = (int) $this->option('limit');
        $verified = 0;

        Booking::with('bookingSeats')
            ->where('status', 'pending')
            ->whereNotNull('payment_md5')
            ->where('payment_expires_at', '>', now())
            ->limit($limit)
            ->chunkById(10, function ($bookings) use ($bakong, $payments, &$verified) {
                foreach ($bookings as $booking) {
                    $result = $bakong->checkTransactionByMd5($booking->payment_md5);

                    if (! $bakong->isPaid($result) || ! $bakong->amountMatches($result, (float) $booking->total_amount)) {
                        continue;
                    }

                    DB::transaction(fn () => $payments->confirm($booking));

                    $this->info("Booking {$booking->booking_code} confirmed, tickets issued.");

                    $verified++;
                }
            });

        $this->info("Verified {$verified} pending payment(s).");

        return self::SUCCESS;
    }
}
