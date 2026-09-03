<?php

namespace App\Http\Controllers;

use App\Models\Showtime;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShowtimeController extends Controller
{
    public function index(): JsonResponse
    {
        $showtimes = Showtime::with(['movie', 'room.cinema'])->get();

        return response()->json($showtimes);
    }

    public function show(int $id): JsonResponse
    {
        $showtime = Showtime::with(['movie', 'room.cinema'])->find($id);

        if (!$showtime) {
            return response()->json([
                'message' => 'Showtime not found'
            ], 404);
        }

        return response()->json($showtime);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'movie_id' => [
                'required',
                'integer',
                'exists:movies,id'
            ],
            'room_id' => [
                'required',
                'integer',
                'exists:rooms,id'
            ],
            'start_time' => [
                'required',
                'date'
            ],
            'end_time' => [
                'required',
                'date',
                'after:start_time'
            ],
            'price' => [
                'required',
                'numeric',
                'min:0'
            ],
        ]);

        $showtime = Showtime::create($validated);

        return response()->json(
            $showtime->load(['movie', 'room.cinema']),
            201
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $showtime = Showtime::find($id);

        if (!$showtime) {
            return response()->json([
                'message' => 'Showtime not found'
            ], 404);
        }

        $validated = $request->validate([
            'movie_id' => [
                'sometimes',
                'integer',
                'exists:movies,id'
            ],
            'room_id' => [
                'sometimes',
                'integer',
                'exists:rooms,id'
            ],
            'start_time' => [
                'sometimes',
                'date'
            ],
            'end_time' => [
                'sometimes',
                'date',
                'after:start_time'
            ],
            'price' => [
                'sometimes',
                'numeric',
                'min:0'
            ],
        ]);

        $showtime->update($validated);

        return response()->json(
            $showtime->load(['movie', 'room.cinema'])
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $showtime = Showtime::find($id);

        if (!$showtime) {
            return response()->json([
                'message' => 'Showtime not found'
            ], 404);
        }

        $showtime->delete();

        return response()->json([
            'message' => 'Showtime deleted successfully'
        ]);
    }
}
