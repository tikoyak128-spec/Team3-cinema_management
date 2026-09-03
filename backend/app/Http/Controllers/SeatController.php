<?php

namespace App\Http\Controllers;

use App\Models\Seat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SeatController extends Controller
{
    public function index(): JsonResponse
    {
        $seats = Seat::with('room')->get();

        return response()->json($seats);
    }

    public function show(int $id): JsonResponse
    {
        $seat = Seat::with('room')->find($id);

        if (!$seat) {
            return response()->json([
                'message' => 'Seat not found'
            ], 404);
        }

        return response()->json($seat);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'room_id' => [
                'required',
                'integer',
                'exists:rooms,id'
            ],
            'seat_number' => [
                'required',
                'string',
                'max:255',
                Rule::unique('seats', 'seat_number')
            ],
            'seat_type' => [
                'required',
                Rule::in(['regular', 'vip', 'couple'])
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

        if (!$seat) {
            return response()->json([
                'message' => 'Seat not found'
            ], 404);
        }

        $validated = $request->validate([
            'room_id' => [
                'sometimes',
                'integer',
                'exists:rooms,id'
            ],
            'seat_number' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('seats', 'seat_number')->ignore($seat->id)
            ],
            'seat_type' => [
                'sometimes',
                Rule::in(['regular', 'vip', 'couple'])
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

        if (!$seat) {
            return response()->json([
                'message' => 'Seat not found'
            ], 404);
        }

        $seat->delete();

        return response()->json([
            'message' => 'Seat deleted successfully'
        ]);
    }
}
