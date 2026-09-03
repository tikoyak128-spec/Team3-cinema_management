<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\Seat;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SeatController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'room_id' => ['required', 'exists:cinema_rooms,id'],
        ]);

        $seats = Seat::where('cinema_room_id', $request->room_id)
            ->orderBy('row')
            ->orderBy('seat_number')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $seats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cinema_room_id' => ['required', 'exists:cinema_rooms,id'],
            'seat_number' => ['required', 'string', 'max:20'],
            'row' => ['required', 'string', 'max:10'],
            'seat_type' => ['required', Rule::in(['regular', 'vip', 'couple'])],
        ]);

        $validated['seat_type'] = $validated['seat_type'] ?? 'regular';

        $exists = Seat::where('cinema_room_id', $validated['cinema_room_id'])
            ->where('row', $validated['row'])
            ->where('seat_number', $validated['seat_number'])
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'This seat already exists in the room.',
            ], 422);
        }

        $seat = Seat::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Seat created successfully',
            'data' => $seat,
        ], 201);
    }

    public function update(Request $request, Seat $seat)
    {
        $validated = $request->validate([
            'seat_number' => ['sometimes', 'string', 'max:20'],
            'row' => ['sometimes', 'string', 'max:10'],
            'seat_type' => ['sometimes', Rule::in(['regular', 'vip', 'couple'])],
        ]);

        $seat->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Seat updated successfully',
            'data' => $seat,
        ]);
    }

    public function destroy(Seat $seat)
    {
        $seat->delete();

        return response()->json([
            'success' => true,
            'message' => 'Seat deleted successfully',
        ]);
    }

    // Generate a full grid of seats for a room
    public function bulk(Request $request)
    {
        $validated = $request->validate([
            'cinema_room_id' => ['required', 'exists:cinema_rooms,id'],
            'rows' => ['required', 'integer', 'min:1', 'max:26'],
            'seats_per_row' => ['required', 'integer', 'min:1', 'max:50'],
            'start_row' => ['nullable', 'string', 'max:1'],
            'seat_type' => ['required', Rule::in(['regular', 'vip', 'couple'])],
        ]);

        $room = Room::findOrFail($validated['cinema_room_id']);
        $startRow = strtoupper($validated['start_row'] ?? 'A');

        $created = 0;
        $skipped = 0;

        for ($i = 0; $i < $validated['rows']; $i++) {
            $row = chr(ord($startRow) + $i);
            for ($n = 1; $n <= $validated['seats_per_row']; $n++) {
                Seat::firstOrCreate(
                    [
                        'cinema_room_id' => $room->id,
                        'row' => $row,
                        'seat_number' => (string) $n,
                    ],
                    ['seat_type' => $validated['seat_type']]
                )->wasRecentlyCreated ? $created++ : $skipped++;
            }
        }

        $room->update(['capacity' => $room->seats()->count()]);

        return response()->json([
            'success' => true,
            'message' => "Generated {$created} seat(s), skipped {$skipped} existing.",
            'count' => $created,
        ], 201);
    }

    // Delete all seats in a room
    public function clear(Request $request)
    {
        $request->validate([
            'room_id' => ['required', 'exists:cinema_rooms,id'],
        ]);

        $room = Room::findOrFail($request->room_id);
        $deleted = $room->seats()->delete();
        $room->update(['capacity' => 0]);

        return response()->json([
            'success' => true,
            'message' => "Deleted {$deleted} seat(s).",
        ]);
    }
}