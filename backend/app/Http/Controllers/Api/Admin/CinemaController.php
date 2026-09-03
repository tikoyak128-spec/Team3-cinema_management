<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Cinema;
use Illuminate\Http\Request;

class CinemaController extends Controller
{
    public function index()
    {
        $cinemas = Cinema::withCount('rooms')->latest()->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $cinemas,
        ]);
    }

    public function show(Cinema $cinema)
    {
        $cinema->load('rooms');

        return response()->json([
            'success' => true,
            'data' => $cinema,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'description' => ['nullable', 'string'],
        ]);

        $cinema = Cinema::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cinema created successfully',
            'data' => $cinema,
        ], 201);
    }

    public function update(Request $request, Cinema $cinema)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'location' => ['sometimes', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'description' => ['nullable', 'string'],
        ]);

        $cinema->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cinema updated successfully',
            'data' => $cinema,
        ]);
    }

    public function destroy(Cinema $cinema)
    {
        $cinema->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cinema deleted successfully',
        ]);
    }
}