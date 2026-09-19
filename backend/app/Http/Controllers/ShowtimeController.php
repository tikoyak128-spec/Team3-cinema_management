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
            'cinema_room_id' => [
                'required',
                'integer',
                'exists:cinema_rooms,id'
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
            'status' => [
                'nullable',
                'string',
                'max:255'
            ],
        ]);

        $conflict = $this->findConflictingShowtime(
            (int) $validated['cinema_room_id'],
            $validated['start_time'],
            $validated['end_time']
        );

        if ($conflict) {
            return response()->json([
                'message' => 'This room already screens another movie during the requested time window.',
                'conflicting_showtime' => $conflict->load(['movie', 'room.cinema']),
            ], 422);
        }

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
            'cinema_room_id' => [
                'sometimes',
                'integer',
                'exists:cinema_rooms,id'
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
            'status' => [
                'nullable',
                'string',
                'max:255'
            ],
        ]);

        $conflict = $this->findConflictingShowtime(
            (int) ($validated['cinema_room_id'] ?? $showtime->cinema_room_id),
            $validated['start_time'] ?? $showtime->start_time,
            $validated['end_time'] ?? $showtime->end_time,
            $showtime->id
        );

        if ($conflict) {
            return response()->json([
                'message' => 'This room already screens another movie during the requested time window.',
                'conflicting_showtime' => $conflict->load(['movie', 'room.cinema']),
            ], 422);
        }

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

    private function findConflictingShowtime(
        int $roomId,
        string $startTime,
        string $endTime,
        ?int $excludeId = null
    ): ?Showtime {
        return Showtime::where('id', '!=', $excludeId ?? 0)
            ->where('status', 'active')
            ->where('cinema_room_id', $roomId)
            ->where('start_time', '<', $endTime)
            ->where('end_time', '>', $startTime)
            ->orderBy('start_time')
            ->first();
    }
}
