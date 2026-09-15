<?php

namespace App\Http\Controllers;

use App\Models\Cinema;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CinemaController extends Controller
{
    public function __construct(
        private CloudinaryService $cloudinary
    ) {}

    public function index(): JsonResponse
    {
        $cinemas = Cinema::with('rooms')->get();

        return response()->json($cinemas->map(fn (Cinema $cinema) => $this->decorate($cinema)));
    }

    public function show(int $id): JsonResponse
    {
        $cinema = Cinema::with('rooms')->find($id);

        if (! $cinema) {
            return response()->json([
                'message' => 'Cinema not found',
            ], 404);
        }

        return response()->json($this->decorate($cinema));
    }

    private function decorate(Cinema $cinema): array
    {
        $data = $cinema->toArray();
        $data['screen_count'] = $cinema->rooms->count();
        $data['seats_count'] = $cinema->rooms->sum('total_seats');

        return $data;
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('cinemas', 'name'),
            ],
            'location' => [
                'required',
                'string',
            ],
            'area' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:50'],
            'hours' => ['nullable', 'string', 'max:50'],
            'image_file' => [
                'nullable',
                'file',
                'max:10240',
                'mimes:jpg,jpeg,png,gif,webp',
            ],
            'image' => ['nullable', 'string', 'max:500'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'features' => ['nullable', 'array'],
            'features.*' => ['string', 'max:50'],
            'description' => ['nullable', 'string'],
        ]);

        if ($request->hasFile('image_file')) {
            $validated['image'] = $this->cloudinary->uploadImage($request->file('image_file'), 'cinema/cinemas');
        }

        unset($validated['image_file']);

        $cinema = Cinema::create($validated);

        return response()->json(
            $this->decorate($cinema->load('rooms')),
            201
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $cinema = Cinema::find($id);

        if (! $cinema) {
            return response()->json([
                'message' => 'Cinema not found',
            ], 404);
        }

        $validated = $request->validate([
            'name' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('cinemas', 'name')->ignore($cinema->id),
            ],
            'location' => [
                'sometimes',
                'string',
            ],
            'area' => ['sometimes', 'string', 'max:100'],
            'phone' => ['sometimes', 'string', 'max:50'],
            'hours' => ['sometimes', 'string', 'max:50'],
            'image_file' => [
                'nullable',
                'file',
                'max:10240',
                'mimes:jpg,jpeg,png,gif,webp',
            ],
            'image' => ['sometimes', 'string', 'max:500'],
            'tagline' => ['sometimes', 'string', 'max:255'],
            'features' => ['sometimes', 'array'],
            'features.*' => ['string', 'max:50'],
            'description' => ['sometimes', 'string'],
        ]);

        if ($request->hasFile('image_file')) {
            $validated['image'] = $this->cloudinary->uploadImage($request->file('image_file'), 'cinema/cinemas');
        }

        unset($validated['image_file']);

        $cinema->update($validated);

        return response()->json(
            $this->decorate($cinema->load('rooms'))
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $cinema = Cinema::find($id);

        if (! $cinema) {
            return response()->json([
                'message' => 'Cinema not found',
            ], 404);
        }

        $cinema->delete();

        return response()->json([
            'message' => 'Cinema deleted successfully',
        ]);
    }
}
