<?php

namespace App\Http\Controllers;

use App\Models\Promotion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PromotionController extends Controller
{
    public function index(): JsonResponse
    {
        $promotions = Promotion::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return response()->json($promotions);
    }

    public function show(int $id): JsonResponse
    {
        $promotion = Promotion::find($id);

        if (!$promotion) {
            return response()->json([
                'message' => 'Promotion not found'
            ], 404);
        }

        return response()->json($promotion);
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

        if (!$promotion) {
            return response()->json([
                'message' => 'Promotion not found'
            ], 404);
        }

        $validated = $request->validate($this->rules(true));

        $promotion->update($validated);

        return response()->json($promotion);
    }

    public function destroy(int $id): JsonResponse
    {
        $promotion = Promotion::find($id);

        if (!$promotion) {
            return response()->json([
                'message' => 'Promotion not found'
            ], 404);
        }

        $promotion->delete();

        return response()->json([
            'message' => 'Promotion deleted successfully'
        ]);
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
            'type' => [$prefix . 'string', Rule::in(['tickets', 'snacks', 'combo', 'loyalty', 'other'])],
            'price_label' => $prefix . 'string|max:50',
            'price_amount' => $prefix . 'string|max:20',
            'expires_days' => $prefix . 'integer|min:0|max:365',
            'popular' => $prefix . 'boolean',
            'sort_order' => $prefix . 'integer|min:0',
            'is_active' => $prefix . 'boolean',
        ];
    }
}