<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoomController extends Controller
{
    public function index(): JsonResponse
    {
        $rooms = Room::with('cinema')->get();

        return response()->json($rooms);
    }

    public function show(int $id): JsonResponse
    {
        $room = Room::with('cinema')->find($id);

        if (!$room) {
            return response()->json([
                'message' => 'Room not found'
            ], 404);
        }

        return response()->json($room);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cinema_id' => [
                'required',
                'integer',
                'exists:cinemas,id'
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('cinema_rooms', 'name')
            ],
            'capacity' => [
                'required',
                'integer',
                'min:1'
            ],
        ]);

        $room = Room::create($validated);

        return response()->json(
            $room->load('cinema'),
            201
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $room = Room::find($id);

        if (!$room) {
            return response()->json([
                'message' => 'Room not found'
            ], 404);
        }

        $validated = $request->validate([
            'cinema_id' => [
                'sometimes',
                'integer',
                'exists:cinemas,id'
            ],
            'name' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('cinema_rooms', 'name')->ignore($room->id)
            ],
            'capacity' => [
                'sometimes',
                'integer',
                'min:1'
            ],
        ]);

        $room->update($validated);

        return response()->json(
            $room->load('cinema')
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $room = Room::find($id);

        if (!$room) {
            return response()->json([
                'message' => 'Room not found'
            ], 404);
        }

        $room->delete();

        return response()->json([
            'message' => 'Room deleted successfully'
        ]);
    }
}
