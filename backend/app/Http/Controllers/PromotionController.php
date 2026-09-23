<?php

namespace App\Http\Controllers;

use App\Models\Promotion;
use App\Models\PromotionClaim;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class PromotionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $this->optionalUser();

        $promotions = Promotion::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (Promotion $promotion) => $this->decorate($promotion, $user))
            ->values();

        return response()->json($promotions);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $promotion = Promotion::find($id);

        if (! $promotion) {
            return response()->json([
                'message' => 'Promotion not found',
            ], 404);
        }

        return response()->json($this->decorate($promotion, $this->optionalUser()));
    }

    public function claim(Request $request, int $id): JsonResponse
    {
        $promotion = Promotion::find($id);

        if (! $promotion || ! $promotion->is_active) {
            return response()->json([
                'message' => 'Promotion not found or is no longer active',
            ], 404);
        }

        if ($promotion->type === 'loyalty' && ! $promotion->discount_code) {
            return response()->json([
                'message' => 'This promotion cannot be claimed online.',
            ], 422);
        }

        $user = $request->user();
        $eligibility = $promotion->eligibilityFor($user);

        if ($eligibility['claimed']) {
            return response()->json([
                'message' => 'Promotion already claimed.',
                'promotion_id' => $promotion->id,
                'discount_code' => $eligibility['claimed_code'] ?? $promotion->discount_code,
                'expires_at' => $eligibility['claimed_expires_at'],
            ]);
        }

        if (! $eligibility['eligible']) {
            return response()->json([
                'message' => 'You have not met the requirements for this promotion yet.',
                'claim' => $eligibility,
            ], 422);
        }

        if (! $promotion->discount_code) {
            return response()->json([
                'message' => 'This promotion cannot be claimed online.',
                'claim' => $eligibility,
            ], 422);
        }

        $claim = PromotionClaim::updateOrCreate(
            [
                'user_id' => $user->id,
                'promotion_id' => $promotion->id,
            ],
            [
                'discount_code' => $promotion->discount_code,
                'expires_at' => now()->addDays((int) $promotion->expires_days),
            ]
        );

        return response()->json([
            'message' => 'Promotion claimed successfully.',
            'promotion_id' => $promotion->id,
            'discount_code' => $claim->discount_code,
            'expires_at' => $claim->expires_at?->toIso8601String(),
        ], 201);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate($this->rules());

        $promotion = Promotion::create($validated);

        return response()->json($promotion, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $promotion = Promotion::find($id);

        if (! $promotion) {
            return response()->json([
                'message' => 'Promotion not found',
            ], 404);
        }

        $validated = $request->validate($this->rules(true));

        $promotion->update($validated);

        return response()->json($promotion);
    }

    public function destroy(int $id): JsonResponse
    {
        $promotion = Promotion::find($id);

        if (! $promotion) {
            return response()->json([
                'message' => 'Promotion not found',
            ], 404);
        }

        $promotion->delete();

        return response()->json([
            'message' => 'Promotion deleted successfully',
        ]);
    }

    private function optionalUser(): ?User
    {
        return Auth::guard('sanctum')->user();
    }

    private function decorate(Promotion $promotion, ?User $user): array
    {
        $item = $promotion->toArray();
        $isStaff = $user && in_array($user->role ?? '', ['admin', 'staff'], true);

        unset($item['discount_code']);

        $eligibility = $promotion->eligibilityFor($user);

        if ($user) {
            if ($isStaff || $eligibility['claimed']) {
                $item['discount_code'] = $eligibility['claimed_code'] ?? $promotion->discount_code;
            }
        }

        $item['claim'] = $eligibility;

        return $item;
    }

    private function rules(bool $partial = false): array
    {
        $prefix = $partial ? 'sometimes|' : '';

        return [
            'icon' => $prefix . 'string|max:50',
            'tag' => $prefix . 'string|max:100',
            'title' => $prefix . 'string|max:255',
            'text' => $prefix . 'string',
            'discount' => $prefix . 'string|max:20',
            'discount_code' => $prefix . 'nullable|string|max:50',
            'type' => [$prefix . 'string', Rule::in(['tickets', 'snacks', 'combo', 'loyalty', 'other'])],
            'price_label' => $prefix . 'string|max:50',
            'price_amount' => $prefix . 'string|max:20',
            'expires_days' => $prefix . 'integer|min:0|max:365',
            'popular' => $prefix . 'boolean',
            'sort_order' => $prefix . 'integer|min:0',
            'is_active' => $prefix . 'boolean',
            'min_bookings' => $prefix . 'integer|min:0',
            'min_spent' => $prefix . 'numeric|min:0',
            'require_verified_email' => $prefix . 'boolean',
        ];
    }
}