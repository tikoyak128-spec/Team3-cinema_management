<?php

namespace App\Http\Controllers;

use App\Models\HeroImage;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class HeroImageController extends Controller
{
    public function __construct(
        private CloudinaryService $cloudinary
    ) {}

    public function index(): JsonResponse
    {
        return response()->json(HeroImage::orderBy('id')->get());
    }

    public function show(int $id): JsonResponse
    {
        $hero = HeroImage::find($id);

        if (! $hero) {
            return response()->json([
                'message' => 'Hero image not found',
            ], 404);
        }

        return response()->json($hero);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => [
                'required',
                'string',
                'max:50',
                Rule::unique('hero_images', 'page'),
            ],
            'image' => ['required_without:image_file', 'nullable', 'string', 'max:191'],
            'image_file' => [
                'nullable',
                'file',
                'max:10240',
                'mimes:jpg,jpeg,png,gif,webp',
            ],
        ]);

        if ($request->hasFile('image_file')) {
            $validated['image'] = $this->cloudinary->uploadImage($request->file('image_file'), 'cinema/heroes');
        }

        unset($validated['image_file']);

        $hero = HeroImage::create($validated);

        return response()->json($hero, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $hero = HeroImage::find($id);

        if (! $hero) {
            return response()->json([
                'message' => 'Hero image not found',
            ], 404);
        }

        $validated = $request->validate([
            'page' => [
                'sometimes',
                'string',
                'max:50',
                Rule::unique('hero_images', 'page')->ignore($hero->id),
            ],
            'image' => ['sometimes', 'nullable', 'string', 'max:191'],
            'image_file' => [
                'nullable',
                'file',
                'max:10240',
                'mimes:jpg,jpeg,png,gif,webp',
            ],
        ]);

        if ($request->hasFile('image_file')) {
            $validated['image'] = $this->cloudinary->uploadImage($request->file('image_file'), 'cinema/heroes');
        }

        unset($validated['image_file']);

        $hero->update($validated);

        return response()->json($hero);
    }

    public function destroy(int $id): JsonResponse
    {
        $hero = HeroImage::find($id);

        if (! $hero) {
            return response()->json([
                'message' => 'Hero image not found',
            ], 404);
        }

        $hero->delete();

        return response()->json([
            'message' => 'Hero image deleted successfully',
        ]);
    }
}