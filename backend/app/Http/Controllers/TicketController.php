<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function searchByCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:255'],
        ]);

        $code = strtoupper(trim($validated['code']));

        $tickets = Ticket::with([
            'booking.showtime.movie',
            'booking.showtime.room.cinema',
            'booking.bookingSeats.seat',
        ])
            ->where('ticket_code', 'LIKE', '%'.$code.'%')
            ->orWhereHas('booking', fn ($q) => $q->where('booking_code', 'LIKE', '%'.$code.'%'))
            ->orderByDesc('id')
            ->limit(20)
            ->get();

        return response()->json($tickets);
    }

    public function show(int $id): JsonResponse
    {
        $ticket = Ticket::with([
            'booking.showtime.movie',
            'booking.showtime.room.cinema',
        ])->find($id);

        if (! $ticket) {
            return response()->json([
                'message' => 'Ticket not found',
            ], 404);
        }

        return response()->json($ticket);
    }

    public function checkIn(int $id): JsonResponse
    {
        $ticket = Ticket::find($id);

        if (! $ticket) {
            return response()->json([
                'message' => 'Ticket not found',
            ], 404);
        }

        if ($ticket->status === 'checked_in') {
            return response()->json([
                'message' => 'Ticket has already been checked in',
                'ticket' => $ticket->load('booking.showtime'),
            ], 422);
        }

        if ($ticket->status === 'cancelled') {
            return response()->json([
                'message' => 'Cannot check in a cancelled ticket',
                'ticket' => $ticket->load('booking.showtime'),
            ], 422);
        }

        $ticket->update([
            'status' => 'checked_in',
        ]);

        return response()->json(
            $ticket->load('booking.showtime')
        );
    }
}
