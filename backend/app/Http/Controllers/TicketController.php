<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Illuminate\Http\JsonResponse;

class TicketController extends Controller
{
    public function show(int $id): JsonResponse
    {
        $ticket = Ticket::with([
            'booking.showtime.movie',
            'booking.showtime.room.cinema',
        ])->find($id);

        if (!$ticket) {
            return response()->json([
                'message' => 'Ticket not found'
            ], 404);
        }

        return response()->json($ticket);
    }

    public function checkIn(int $id): JsonResponse
    {
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json([
                'message' => 'Ticket not found'
            ], 404);
        }

        if ($ticket->status === 'checked_in') {
            return response()->json([
                'message' => 'Ticket has already been checked in',
                'ticket' => $ticket->load('booking.showtime')
            ], 422);
        }

        if ($ticket->status === 'cancelled') {
            return response()->json([
                'message' => 'Cannot check in a cancelled ticket',
                'ticket' => $ticket->load('booking.showtime')
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
