<?php

namespace App\Http\Controllers;

use App\Models\TeamMember;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeamMemberController extends Controller
{
    public function __construct(
        private CloudinaryService $cloudinary
    ) {}

    public function index(): JsonResponse
    {
        $members = TeamMember::orderBy('sort_order')->orderBy('id')->get();

        return response()->json($members);
    }

    public function show(int $id): JsonResponse
    {
        $member = TeamMember::find($id);

        if (! $member) {
            return response()->json([
                'message' => 'Team member not found',
            ], 404);
        }

        return response()->json($member);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateMember($request);

        if ($request->hasFile('image_file')) {
            $validated['image'] = $this->cloudinary->uploadImage($request->file('image_file'), 'cinema/team');
        }

        unset($validated['image_file']);

        $member = TeamMember::create($validated);

        return response()->json($member, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $member = TeamMember::find($id);

        if (! $member) {
            return response()->json([
                'message' => 'Team member not found',
            ], 404);
        }

        $validated = $this->validateMember($request, forUpdate: true);

        if ($request->hasFile('image_file')) {
            $validated['image'] = $this->cloudinary->uploadImage($request->file('image_file'), 'cinema/team');
        }

        unset($validated['image_file']);

        $member->update($validated);

        return response()->json($member);
    }

    public function destroy(int $id): JsonResponse
    {
        $member = TeamMember::find($id);

        if (! $member) {
            return response()->json([
                'message' => 'Team member not found',
            ], 404);
        }

        $member->delete();

        return response()->json([
            'message' => 'Team member deleted successfully',
        ]);
    }

    private function validateMember(Request $request, bool $forUpdate = false): array
    {
        $imageRule = $forUpdate ? ['sometimes', 'nullable', 'string', 'max:500'] : ['required', 'string', 'max:500'];

        return $request->validate([
            'name' => [$forUpdate ? 'sometimes' : 'required', 'string', 'max:255'],
            'role' => [$forUpdate ? 'sometimes' : 'required', 'string', 'max:255'],
            'image' => $imageRule,
            'image_file' => [
                'nullable',
                'file',
                'max:10240',
                'mimes:jpg,jpeg,png,gif,webp',
            ],
            'facebook' => ['nullable', 'string', 'max:500'],
            'linkedin' => ['nullable', 'string', 'max:500'],
            'twitter' => ['nullable', 'string', 'max:500'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
    }
}