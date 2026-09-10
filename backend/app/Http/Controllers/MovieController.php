<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MovieController extends Controller
{
    public function index(): JsonResponse
    {
        $movies = Movie::with('category')->get();

        return response()->json($movies);
    }

    public function show(int $id): JsonResponse
    {
        $movie = Movie::with('category')->find($id);

        if (!$movie) {
            return response()->json([
                'message' => 'Movie not found'
            ], 404);
        }

        return response()->json($movie);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'movie_category_id' => [
                'required',
                'integer',
                'exists:movie_categories,id'
            ],
            'title' => [
                'required',
                'string',
                'max:255',
                Rule::unique('movies', 'title')
            ],
            'description' => [
                'required',
                'string'
            ],
            'duration' => [
                'required',
                'integer',
                'min:1'
            ],
            'release_date' => [
                'required',
                'date'
            ],
            'poster' => [
                'required',
                'string',
                'url'
            ],
            'trailer_url' => [
                'nullable',
                'string',
                'url'
            ],
            'rating' => [
                'nullable',
                'numeric',
                'min:0',
                'max:10'
            ],
            'status' => [
                'nullable',
                'string',
                'max:255'
            ],
        ]);

        $movie = Movie::create($validated);

        return response()->json(
            $movie->load('category'),
            201
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $movie = Movie::find($id);

        if (!$movie) {
            return response()->json([
                'message' => 'Movie not found'
            ], 404);
        }

        $validated = $request->validate([
            'movie_category_id' => [
                'sometimes',
                'integer',
                'exists:movie_categories,id'
            ],
            'title' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('movies', 'title')->ignore($movie->id)
            ],
            'description' => [
                'sometimes',
                'string'
            ],
            'duration' => [
                'sometimes',
                'integer',
                'min:1'
            ],
            'release_date' => [
                'sometimes',
                'date'
            ],
            'poster' => [
                'sometimes',
                'string',
                'url'
            ],
            'trailer_url' => [
                'nullable',
                'string',
                'url'
            ],
            'rating' => [
                'nullable',
                'numeric',
                'min:0',
                'max:10'
            ],
            'status' => [
                'nullable',
                'string',
                'max:255'
            ],
        ]);

        $movie->update($validated);

        return response()->json(
            $movie->load('category')
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $movie = Movie::find($id);

        if (!$movie) {
            return response()->json([
                'message' => 'Movie not found'
            ], 404);
        }

        $movie->delete();

        return response()->json([
            'message' => 'Movie deleted successfully'
        ]);
    }
}
