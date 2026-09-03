<?php

namespace App\Http\Controllers;

use App\Models\Cinema;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CinemaController extends Controller
{
    public function index(): JsonResponse
    {
        $cinemas = Cinema::with('rooms')->get();

        return response()->json($cinemas);
    }

    public function show(int $id): JsonResponse
    {
        $cinema = Cinema::with('rooms')->find($id);

        if (!$cinema) {
            return response()->json([
                'message' => 'Cinema not found'
            ], 404);
        }

        return response()->json($cinema);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('cinemas', 'name')
            ],
            'location' => [
                'required',
                'string'
            ],
        ]);

        $cinema = Cinema::create($validated);

        return response()->json(
            $cinema->load('rooms'),
            201
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $cinema = Cinema::find($id);

        if (!$cinema) {
            return response()->json([
                'message' => 'Cinema not found'
            ], 404);
        }

        $validated = $request->validate([
            'name' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('cinemas', 'name')->ignore($cinema->id)
            ],
            'location' => [
                'sometimes',
                'string'
            ],
        ]);

        $cinema->update($validated);

        return response()->json(
            $cinema->load('rooms')
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $cinema = Cinema::find($id);

        if (!$cinema) {
            return response()->json([
                'message' => 'Cinema not found'
            ], 404);
        }

        $cinema->delete();

        return response()->json([
            'message' => 'Cinema deleted successfully'
        ]);
    }
}
