<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Showtime;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class ShowtimeController extends Controller
{
    public function index(Request $request)
    {
        $query = Showtime::with(['movie', 'room.cinema', 'bookings'])
            ->latest('start_time');

        if ($request->filled('movie_id')) {
            $query->where('movie_id', $request->movie_id);
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate(15),
        ]);
    }

    public function show(Showtime $showtime)
    {
        $showtime->load('movie', 'room.cinema');

        return response()->json([
            'success' => true,
            'data' => $showtime,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'movie_id' => ['required', 'exists:movies,id'],
            'cinema_room_id' => ['required', 'exists:cinema_rooms,id'],
            'start_time' => ['required', 'date'],
            'end_time' => ['required', 'date', 'after:start_time'],
            'price' => ['required', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:active,inactive'],
        ]);

        $this->ensureNoOverlap(
            $validated['cinema_room_id'],
            $validated['start_time'],
            $validated['end_time']
        );

        $showtime = Showtime::create([
            'movie_id' => $validated['movie_id'],
            'cinema_room_id' => $validated['cinema_room_id'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'price' => $validated['price'],
            'status' => $validated['status'] ?? 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Showtime created successfully',
            'data' => $showtime->load('movie', 'room.cinema'),
        ], 201);
    }

    public function update(Request $request, Showtime $showtime)
    {
        $validated = $request->validate([
            'movie_id' => ['sometimes', 'exists:movies,id'],
            'cinema_room_id' => ['sometimes', 'exists:cinema_rooms,id'],
            'start_time' => ['sometimes', 'date'],
            'end_time' => ['sometimes', 'date', 'after:start_time'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'status' => ['sometimes', 'in:active,inactive'],
        ]);

        if (!empty($validated['start_time']) || !empty($validated['end_time']) || !empty($validated['cinema_room_id'])) {
            $this->ensureNoOverlap(
                $validated['cinema_room_id'] ?? $showtime->cinema_room_id,
                $validated['start_time'] ?? $showtime->start_time,
                $validated['end_time'] ?? $showtime->end_time,
                $showtime->id
            );
        }

        $showtime->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Showtime updated successfully',
            'data' => $showtime->load('movie', 'room.cinema'),
        ]);
    }

    public function destroy(Showtime $showtime)
    {
        $showtime->delete();

        return response()->json([
            'success' => true,
            'message' => 'Showtime deleted successfully',
        ]);
    }

    // One room can only show one movie at a time - reject overlapping showtimes
    protected function ensureNoOverlap(int $roomId, string $start, string $end, ?int $ignoreId = null): void
    {
        $startAt = Carbon::parse($start);
        $endAt = Carbon::parse($end);

        $overlap = Showtime::where('cinema_room_id', $roomId)
            ->where('status', 'active')
            ->where('id', '!=', $ignoreId)
            ->where('start_time', '<', $endAt)
            ->where('end_time', '>', $startAt)
            ->exists();

        if ($overlap) {
            throw ValidationException::withMessages([
                'start_time' => 'This room already has a movie scheduled at that time.',
            ]);
        }
    }
}