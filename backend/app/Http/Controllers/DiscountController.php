<?php

namespace App\Http\Controllers;

use App\Models\Discount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DiscountController extends Controller
{
    public function index(): JsonResponse
    {
        $discounts = Discount::orderByDesc('id')->get();

        return response()->json($discounts);
    }

    public function show(int $id): JsonResponse
    {
        $discount = Discount::find($id);

        if (! $discount) {
            return response()->json([
                'message' => 'Discount not found',
            ], 404);
        }

        return response()->json($discount);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateDiscount($request);

        $discount = Discount::create($validated);

        return response()->json($discount, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $discount = Discount::find($id);

        if (! $discount) {
            return response()->json([
                'message' => 'Discount not found',
            ], 404);
        }

        $validated = $this->validateDiscount($request, $discount->id);

        $discount->update($validated);

        return response()->json($discount);
    }

    public function destroy(int $id): JsonResponse
    {
        $discount = Discount::find($id);

        if (! $discount) {
            return response()->json([
                'message' => 'Discount not found',
            ], 404);
        }

        $discount->delete();

        return response()->json([
            'message' => 'Discount deleted successfully',
        ]);
    }

    private function validateDiscount(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'code' => [
                'required',
                'string',
                'max:255',
                Rule::unique('discounts', 'code')->ignore($ignoreId),
            ],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'type' => ['sometimes', 'string', 'in:percent,fixed'],
            'value' => ['required', 'numeric', 'min:0.01'],
            'min_amount' => ['nullable', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
    }
}