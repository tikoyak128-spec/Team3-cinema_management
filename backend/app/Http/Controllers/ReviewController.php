<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    private function loadWith(array $with = []): array
    {
        return array_merge([
            'user',
            'movie.category',
        ], $with);
    }

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'movie_id' => ['nullable', 'integer', 'exists:movies,id'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $query = Review::with($this->loadWith())->orderByDesc('created_at');

        if (! empty($validated['movie_id'])) {
            $query->where('movie_id', $validated['movie_id']);
        }

        if (! empty($validated['user_id'])) {
            $query->where('user_id', $validated['user_id']);
        }

        return response()->json($query->get());
    }

    public function show(int $id): JsonResponse
    {
        $review = Review::with($this->loadWith())->find($id);

        if (! $review) {
            return response()->json([
                'message' => 'Review not found',
            ], 404);
        }

        return response()->json($review);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'movie_id' => ['required', 'integer', 'exists:movies,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        if (Review::where('user_id', $request->user()->id)
            ->where('movie_id', $validated['movie_id'])
            ->exists()) {
            return response()->json([
                'message' => 'You have already reviewed this movie. You can edit your existing review.',
            ], 422);
        }

        if (! Movie::where('id', $validated['movie_id'])->exists()) {
            return response()->json([
                'message' => 'Movie not found',
            ], 404);
        }

        $review = Review::create([
            'user_id' => $request->user()->id,
            'movie_id' => $validated['movie_id'],
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        return response()->json(
            $review->load($this->loadWith()),
            201
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $review = Review::find($id);

        if (! $review) {
            return response()->json([
                'message' => 'Review not found',
            ], 404);
        }

        $user = $request->user();
        $isAdmin = ($user->role ?? '') === 'admin';

        if (! $isAdmin && $review->user_id !== $user->id) {
            return response()->json([
                'message' => 'You do not own this review',
            ], 403);
        }

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        $review->update($validated);

        return response()->json(
            $review->load($this->loadWith())
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $review = Review::find($id);

        if (! $review) {
            return response()->json([
                'message' => 'Review not found',
            ], 404);
        }

        $user = $request->user();
        $isAdmin = ($user->role ?? '') === 'admin';

        if (! $isAdmin && $review->user_id !== $user->id) {
            return response()->json([
                'message' => 'You do not own this review',
            ], 403);
        }

        $review->delete();

        return response()->json([
            'message' => 'Review deleted successfully',
        ]);
    }

    public function myReviews(Request $request): JsonResponse
    {
        $reviews = Review::with(['movie'])
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($reviews);
    }
}