<?php

namespace App\Http\Controllers;

use App\Models\BookingSeat;
use App\Models\Seat;
use App\Models\Showtime;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SeatController extends Controller
{
    public function forShowtime(Showtime $showtime): JsonResponse
    {
        $room = $showtime->room;

        $seats = Seat::where('cinema_room_id', $room->id)
            ->orderBy('row')
            ->orderBy('seat_number')
            ->get();

        $occupied = BookingSeat::whereIn('seat_id', $seats->pluck('id'))
            ->whereHas('booking', function ($query) use ($showtime) {
                $query->where('showtime_id', $showtime->id)
                    ->whereIn('status', ['pending', 'confirmed']);
            })
            ->pluck('seat_id')
            ->toArray();

        $data = $seats->map(fn (Seat $seat) => [
            'id' => $seat->id,
            'seat_number' => $seat->seat_number,
            'row' => $seat->row,
            'seat_type' => $seat->seat_type,
            'cinema_room_id' => $seat->cinema_room_id,
            'occupied' => in_array($seat->id, $occupied, true),
        ]);

        return response()->json([
            'showtime_id' => $showtime->id,
            'room' => $room->load('cinema'),
            'seats' => $data,
        ]);
    }

    public function index(): JsonResponse
    {
        $seats = Seat::with('room.cinema')->get();

        return response()->json($seats);
    }

    public function show(int $id): JsonResponse
    {
        $seat = Seat::with('room.cinema')->find($id);

        if (! $seat) {
            return response()->json([
                'message' => 'Seat not found',
            ], 404);
        }

        return response()->json($seat);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cinema_room_id' => [
                'required',
                'integer',
                'exists:cinema_rooms,id',
            ],
            'seat_number' => [
                'required',
                'string',
                'max:255',
                Rule::unique('seats')->where(function ($query) use ($request) {
                    return $query->where('cinema_room_id', $request->cinema_room_id);
                }),
            ],
            'row' => [
                'nullable',
                'string',
                'max:255',
            ],
            'seat_type' => [
                'required',
                Rule::in(['regular', 'vip', 'couple']),
            ],
        ]);

        $seat = Seat::create($validated);

        return response()->json(
            $seat->load('room'),
            201
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $seat = Seat::find($id);

        if (! $seat) {
            return response()->json([
                'message' => 'Seat not found',
            ], 404);
        }

        $validated = $request->validate([
            'cinema_room_id' => [
                'sometimes',
                'integer',
                'exists:cinema_rooms,id',
            ],
            'seat_number' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('seats')->ignore($seat->id)->where(function ($query) use ($request, $seat) {
                    return $query->where('cinema_room_id', $request->input('cinema_room_id', $seat->cinema_room_id));
                }),
            ],
            'row' => [
                'nullable',
                'string',
                'max:255',
            ],
            'seat_type' => [
                'sometimes',
                Rule::in(['regular', 'vip', 'couple']),
            ],
        ]);

        $seat->update($validated);

        return response()->json(
            $seat->load('room')
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $seat = Seat::find($id);

        if (! $seat) {
            return response()->json([
                'message' => 'Seat not found',
            ], 404);
        }

        $seat->delete();

        return response()->json([
            'message' => 'Seat deleted successfully',
        ]);
    }
}
