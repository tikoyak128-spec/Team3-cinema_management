<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Movie;
use App\Models\MovieCategory;
use Illuminate\Http\Request;

class MovieController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15) ?: 15;
        $perPage = min(max($perPage, 1), 100);

        $movies = Movie::with('category')->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $movies,
        ]);
    }

    public function show(Movie $movie)
    {
        $movie->load('category', 'showtimes');

        return response()->json([
            'success' => true,
            'data' => $movie,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'movie_category_id' => 'required|exists:movie_categories,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration' => 'required|integer|min:1',
            'release_date' => 'nullable|date',
            'poster' => 'nullable|string',
            'trailer_url' => 'nullable|url',
            'rating' => 'nullable|numeric|min:0|max:10',
            'status' => 'nullable|in:active,inactive',
        ]);

        $movie = Movie::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Movie created successfully',
            'data' => $movie->load('category'),
        ], 201);
    }

    public function update(Request $request, Movie $movie)
    {
        $validated = $request->validate([
            'movie_category_id' => 'sometimes|exists:movie_categories,id',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'duration' => 'sometimes|integer|min:1',
            'release_date' => 'nullable|date',
            'poster' => 'nullable|string',
            'trailer_url' => 'nullable|url',
            'rating' => 'nullable|numeric|min:0|max:10',
            'status' => 'nullable|in:active,inactive',
        ]);

        $movie->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Movie updated successfully',
            'data' => $movie->load('category'),
        ]);
    }

    public function destroy(Movie $movie)
    {
        $movie->delete();

        return response()->json([
            'success' => true,
            'message' => 'Movie deleted successfully',
        ]);
    }
}