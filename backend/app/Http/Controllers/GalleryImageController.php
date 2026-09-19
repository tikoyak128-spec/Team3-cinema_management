<?php

namespace App\Http\Controllers;

use App\Models\GalleryImage;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GalleryImageController extends Controller
{
    public function __construct(
        private CloudinaryService $cloudinary
    ) {}

    public function index(): JsonResponse
    {
        return response()->json(
            GalleryImage::orderBy('sort_order')->orderBy('id')->get()
        );
    }

    public function show(int $id): JsonResponse
    {
        $image = GalleryImage::find($id);

        if (! $image) {
            return response()->json([
                'message' => 'Gallery image not found',
            ], 404);
        }

        return response()->json($image);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateImage($request);

        if ($request->hasFile('image_file')) {
            $validated['image'] = $this->cloudinary->uploadImage($request->file('image_file'), 'cinema/gallery');
        }

        unset($validated['image_file']);

        $image = GalleryImage::create($validated);

        return response()->json($image, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $image = GalleryImage::find($id);

        if (! $image) {
            return response()->json([
                'message' => 'Gallery image not found',
            ], 404);
        }

        $validated = $this->validateImage($request, forUpdate: true);

        if ($request->hasFile('image_file')) {
            $validated['image'] = $this->cloudinary->uploadImage($request->file('image_file'), 'cinema/gallery');
        }

        unset($validated['image_file']);

        $image->update($validated);

        return response()->json($image);
    }

    public function destroy(int $id): JsonResponse
    {
        $image = GalleryImage::find($id);

        if (! $image) {
            return response()->json([
                'message' => 'Gallery image not found',
            ], 404);
        }

        $image->delete();

        return response()->json([
            'message' => 'Gallery image deleted successfully',
        ]);
    }

    private function validateImage(Request $request, bool $forUpdate = false): array
    {
        return $request->validate([
            'title' => [$forUpdate ? 'sometimes' : 'required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'string', 'max:500'],
            'image_file' => [
                'nullable',
                'file',
                'max:10240',
                'mimes:jpg,jpeg,png,gif,webp',
            ],
            'alt' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
    }
}