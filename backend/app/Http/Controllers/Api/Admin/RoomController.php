<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15) ?: 15;
        $perPage = min(max($perPage, 1), 100);

        $query = Room::with('cinema')->withCount('seats');

        if ($request->filled('cinema_id')) {
            $query->where('cinema_id', $request->cinema_id);
        }

        return response()->json([
            'success' => true,
            'data' => $query->latest()->paginate($perPage),
        ]);
    }

    public function show(Room $room)
    {
        $room->load('cinema', 'seats');

        return response()->json([
            'success' => true,
            'data' => $room,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cinema_id' => ['required', 'exists:cinemas,id'],
            'name' => ['required', 'string', 'max:255'],
            'capacity' => ['required', 'integer', 'min:1'],
        ]);

        $room = Room::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Room created successfully',
            'data' => $room->load('cinema'),
        ], 201);
    }

    public function update(Request $request, Room $room)
    {
        $validated = $request->validate([
            'cinema_id' => ['sometimes', 'exists:cinemas,id'],
            'name' => ['sometimes', 'string', 'max:255'],
            'capacity' => ['sometimes', 'integer', 'min:1'],
        ]);

        $room->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Room updated successfully',
            'data' => $room->load('cinema'),
        ]);
    }

    public function destroy(Room $room)
    {
        $room->delete();

        return response()->json([
            'success' => true,
            'message' => 'Room deleted successfully',
        ]);
    }
}