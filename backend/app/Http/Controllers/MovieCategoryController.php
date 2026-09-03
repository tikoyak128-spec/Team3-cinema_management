<?php

namespace App\Http\Controllers;

use App\Models\MovieCategory;
use Illuminate\Http\Request;

class MovieCategoryController extends Controller
{
    public function index()
    {
        $categories = MovieCategory::withCount('movies')->latest()->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    public function show(MovieCategory $movie_category)
    {
        $movie_category->load('movies');

        return response()->json([
            'success' => true,
            'data' => $movie_category,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:movie_categories,name'],
        ]);

        $category = MovieCategory::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Movie category created successfully',
            'data' => $category,
        ], 201);
    }

    public function update(Request $request, MovieCategory $movie_category)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255', \Illuminate\Validation\Rule::unique('movie_categories', 'name')->ignore($movie_category->id)],
        ]);

        $movie_category->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Movie category updated successfully',
            'data' => $movie_category,
        ]);
    }

    public function destroy(MovieCategory $movie_category)
    {
        $movie_category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Movie category deleted successfully',
        ]);
    }
}
