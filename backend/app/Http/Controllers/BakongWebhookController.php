<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Services\BakongService;
use App\Services\BookingPaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BakongWebhookController extends Controller
{
    public function handle(Request $request, BakongService $bakong, BookingPaymentService $payments): JsonResponse
    {
        $configuredToken = config('services.bakong.webhook_token');

        if ($configuredToken && $request->header('X-Bakong-Token') !== $configuredToken) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 401);
        }

        $md5 = (string) ($request->input('md5', $request->input('transactionMd5', $request->input('payment_md5'))));
        $billNo = (string) (strtoupper(trim((string) $request->input('billNumber', $request->input('bill_no', $request->input('billNo'))))));

        $booking = null;

        if ($md5 !== '') {
            $booking = Booking::where('payment_md5', $md5)
                ->where('status', 'pending')
                ->first();
        }

        if (! $booking && $billNo !== '') {
            $booking = Booking::where('booking_code', $billNo)
                ->where('status', 'pending')
                ->first();
        }

        if (! $booking) {
            return response()->json([
                'message' => 'No pending booking found for this payment',
            ], 404);
        }

        $result = $bakong->checkTransactionByMd5($booking->payment_md5);

        if (! $bakong->isPaid($result) || ! $bakong->amountMatches($result, (float) $booking->total_amount)) {
            return response()->json([
                'message' => 'Transaction has not been confirmed by Bakong yet',
            ], 422);
        }

        $booking = DB::transaction(fn () => $payments->confirm($booking));

        return response()->json([
            'message' => 'Payment confirmed',
            'booking_id' => $booking->id,
            'status' => $booking->status,
            'tickets' => $booking->fresh(['tickets'])->tickets,
        ]);
    }
}
