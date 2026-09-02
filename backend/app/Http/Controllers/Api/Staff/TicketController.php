<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'ticket_code' => ['required', 'string'],
        ]);

        $code = trim((string) $request->ticket_code);

        $ticket = Ticket::with([
            'booking.user',
            'booking.showtime.movie.category',
            'booking.showtime.room.cinema',
            'booking.showtime',
            'bookingSeat.seat',
        ])
            ->where('ticket_code', $code)
            ->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => "No ticket found for code: {$code}",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $ticket,
        ]);
    }

    public function checkin(Request $request, Ticket $ticket)
    {
        $ticket->load([
            'booking.user',
            'booking.showtime.movie.category',
            'booking.showtime.room.cinema',
            'bookingSeat.seat',
        ]);

        if ($ticket->status === 'used') {
            return response()->json([
                'success' => false,
                'message' => 'This ticket has already been used.',
                'data' => $ticket,
            ], 422);
        }

        if ($ticket->booking->status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'This ticket belongs to a cancelled booking.',
                'data' => $ticket,
            ], 422);
        }

        $ticket->update(['status' => 'used']);

        return response()->json([
            'success' => true,
            'message' => 'Ticket checked in successfully.',
            'data' => $ticket,
        ]);
    }
}