<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MovieController extends Controller
{
    public function __construct(
        private CloudinaryService $cloudinary
    ) {}

    public function index(): JsonResponse
    {
        $movies = Movie::with('category')->get();

        return response()->json($movies);
    }

    public function show(int $id): JsonResponse
    {
        $movie = Movie::with('category')->find($id);

        if (! $movie) {
            return response()->json([
                'message' => 'Movie not found',
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
                'exists:movie_categories,id',
            ],
            'title' => [
                'required',
                'string',
                'max:255',
                Rule::unique('movies', 'title'),
            ],
            'description' => [
                'required',
                'string',
            ],
            'duration' => [
                'required',
                'integer',
                'min:1',
            ],
            'release_date' => [
                'required',
                'date',
            ],
            'poster_file' => [
                'nullable',
                'file',
                'max:10240',
                'mimes:jpg,jpeg,png,gif,webp',
            ],
            'poster' => [
                'nullable',
                'string',
                'url',
            ],
            'trailer_file' => [
                'nullable',
                'file',
                'max:102400',
                'mimes:mp4,mov,avi,wmv,flv,mkv,webm',
            ],
            'trailer_url' => [
                'nullable',
                'string',
                'url',
            ],
            'rating' => [
                'nullable',
                'numeric',
                'min:0',
                'max:10',
            ],
            'status' => [
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        if ($request->hasFile('poster_file')) {
            $validated['poster'] = $this->cloudinary->uploadImage($request->file('poster_file'), 'cinema/movies/posters');
        } else {
            $validated['poster'] = $this->resolvePoster($validated['poster'] ?? null);
        }

        unset($validated['poster_file']);

        if ($request->hasFile('trailer_file')) {
            $validated['trailer_url'] = $this->cloudinary->uploadVideo($request->file('trailer_file'), 'cinema/movies/trailers');
        }

        unset($validated['trailer_file']);

        $movie = Movie::create($validated);

        return response()->json(
            $movie->load('category'),
            201
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $movie = Movie::find($id);

        if (! $movie) {
            return response()->json([
                'message' => 'Movie not found',
            ], 404);
        }

        $validated = $request->validate([
            'movie_category_id' => [
                'sometimes',
                'integer',
                'exists:movie_categories,id',
            ],
            'title' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('movies', 'title')->ignore($movie->id),
            ],
            'description' => [
                'sometimes',
                'string',
            ],
            'duration' => [
                'sometimes',
                'integer',
                'min:1',
            ],
            'release_date' => [
                'sometimes',
                'date',
            ],
            'poster_file' => [
                'nullable',
                'file',
                'max:10240',
                'mimes:jpg,jpeg,png,gif,webp',
            ],
            'poster' => [
                'nullable',
                'string',
            ],
            'trailer_file' => [
                'nullable',
                'file',
                'max:102400',
                'mimes:mp4,mov,avi,wmv,flv,mkv,webm',
            ],
            'trailer_url' => [
                'nullable',
                'string',
            ],
            'rating' => [
                'nullable',
                'numeric',
                'min:0',
                'max:10',
            ],
            'status' => [
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        if ($request->hasFile('poster_file')) {
            $validated['poster'] = $this->cloudinary->uploadImage($request->file('poster_file'), 'cinema/movies/posters');
        } elseif (array_key_exists('poster', $validated)) {
            $validated['poster'] = $this->resolvePoster($validated['poster'] ?? null);
        } elseif (! $movie->poster) {
            $validated['poster'] = $this->resolvePoster(null);
        } else {
            $currentPoster = $movie->poster;

            if ($this->isExternalPoster($currentPoster)) {
                $validated['poster'] = $this->cloudinary->uploadImageFromUrl($currentPoster, 'cinema/movies/posters') ?? $currentPoster;
            }
        }

        unset($validated['poster_file']);

        if ($request->hasFile('trailer_file')) {
            $validated['trailer_url'] = $this->cloudinary->uploadVideo($request->file('trailer_file'), 'cinema/movies/trailers');
        }

        unset($validated['trailer_file']);

        $movie->update($validated);

        return response()->json(
            $movie->load('category')
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $movie = Movie::find($id);

        if (! $movie) {
            return response()->json([
                'message' => 'Movie not found',
            ], 404);
        }

        $movie->delete();

        return response()->json([
            'message' => 'Movie deleted successfully',
        ]);
    }

    private function resolvePoster(?string $poster): string
    {
        $poster = is_string($poster) ? trim($poster) : '';

        if ($poster === '') {
            return $this->cloudinary->uploadImageFromPath(public_path('images/default-poster.svg'), 'cinema/movies/posters')
                ?? $this->posterFallback();
        }

        if (! $this->isExternalPoster($poster)) {
            return $poster;
        }

        return $this->cloudinary->uploadImageFromUrl($poster, 'cinema/movies/posters')
            ?? $this->posterFallback();
    }

    private function isExternalPoster(string $poster): bool
    {
        return filter_var($poster, FILTER_VALIDATE_URL) !== false
            && ! str_contains($poster, 'res.cloudinary.com');
    }

    private function posterFallback(): string
    {
        return 'https://placehold.co/300x450/050505/e50914/png?text=Khmer+Cinema';
    }
}
