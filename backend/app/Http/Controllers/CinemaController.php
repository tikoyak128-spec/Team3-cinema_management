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
            'address' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email'],
            'website' => ['nullable', 'url'],
            'status' => ['sometimes', 'string', Rule::in(['active', 'inactive'])],
            'halls' => ['sometimes', 'integer', 'min:0'],
            'seats' => ['sometimes', 'integer', 'min:0'],
            'opening_time' => ['nullable', 'date_format:H:i'],
            'closing_time' => ['nullable', 'date_format:H:i'],
            'description' => ['nullable', 'string'],
            'image_url' => ['nullable', 'url'],
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
            'address' => ['sometimes', 'nullable', 'string'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'email' => ['sometimes', 'nullable', 'email'],
            'website' => ['sometimes', 'nullable', 'url'],
            'status' => ['sometimes', 'string', Rule::in(['active', 'inactive'])],
            'halls' => ['sometimes', 'integer', 'min:0'],
            'seats' => ['sometimes', 'integer', 'min:0'],
            'opening_time' => ['sometimes', 'nullable', 'date_format:H:i'],
            'closing_time' => ['sometimes', 'nullable', 'date_format:H:i'],
            'description' => ['sometimes', 'nullable', 'string'],
            'image_url' => ['sometimes', 'nullable', 'url'],
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
