<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Promotion extends Model
{
    protected $fillable = [
        'icon',
        'tag',
        'title',
        'text',
        'discount',
        'discount_code',
        'type',
        'price_label',
        'price_amount',
        'expires_days',
        'popular',
        'sort_order',
        'is_active',
        'min_bookings',
        'min_spent',
        'require_verified_email',
    ];

    protected $casts = [
        'popular' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'expires_days' => 'integer',
        'min_bookings' => 'integer',
        'min_spent' => 'float',
        'require_verified_email' => 'boolean',
    ];

    public function claims(): HasMany
    {
        return $this->hasMany(PromotionClaim::class);
    }

    public function activeClaimFor(User $user): ?PromotionClaim
    {
        return $this->claims()
            ->where('user_id', $user->id)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->latest()
            ->first();
    }

    public function hasActiveClaimBy(User $user): bool
    {
        return $this->activeClaimFor($user) !== null;
    }

    /**
     * Build the eligibility / claim state for a user.
     * Pass null for a public (anonymous) view.
     */
    public function eligibilityFor(?User $user): array
    {
        $requiredBookings = (int) $this->min_bookings;
        $requiredSpent = (float) $this->min_spent;
        $requiresVerifiedEmail = (bool) $this->require_verified_email;

        if (! $user) {
            return $this->eligibilityPayload(
                eligible: false,
                claimed: false,
                claimedCode: null,
                claimedExpiresAt: null,
                requiredBookings: $requiredBookings,
                completedBookings: 0,
                requiredSpent: $requiredSpent,
                totalSpent: 0,
                requiresVerifiedEmail: $requiresVerifiedEmail,
                emailVerified: false
            );
        }

        $stats = Booking::where('user_id', $user->id)
            ->where('status', 'confirmed')
            ->selectRaw('COUNT(*) as booking_count, COALESCE(SUM(total_amount), 0) as total_spent')
            ->first();

        $completedBookings = (int) ($stats->booking_count ?? 0);
        $totalSpent = round((float) ($stats->total_spent ?? 0), 2);
        $emailVerified = (bool) $user->email_verified_at;

        $metBookings = $completedBookings >= $requiredBookings;
        $metSpent = $totalSpent >= $requiredSpent;
        $metEmail = ! $requiresVerifiedEmail || $emailVerified;

        $claim = $this->activeClaimFor($user);

        return $this->eligibilityPayload(
            eligible: $metBookings && $metSpent && $metEmail,
            claimed: (bool) $claim,
            claimedCode: $claim ? ($claim->discount_code ?? $this->discount_code) : null,
            claimedExpiresAt: $claim?->expires_at,
            requiredBookings: $requiredBookings,
            completedBookings: $completedBookings,
            requiredSpent: $requiredSpent,
            totalSpent: $totalSpent,
            requiresVerifiedEmail: $requiresVerifiedEmail,
            emailVerified: $emailVerified
        );
    }

    private function eligibilityPayload(
        bool $eligible,
        bool $claimed,
        ?string $claimedCode,
        $claimedExpiresAt,
        int $requiredBookings,
        int $completedBookings,
        float $requiredSpent,
        float $totalSpent,
        bool $requiresVerifiedEmail,
        bool $emailVerified
    ): array {
        $unmet = [];
        if ($completedBookings < $requiredBookings) {
            $unmet[] = 'bookings';
        }
        if ($totalSpent < $requiredSpent) {
            $unmet[] = 'spent';
        }
        if ($requiresVerifiedEmail && ! $emailVerified) {
            $unmet[] = 'email';
        }

        return [
            'eligible' => $eligible,
            'claimed' => $claimed,
            'claimed_code' => $claimed ? $claimedCode : null,
            'claimed_expires_at' => $claimedExpiresAt
                ? (is_object($claimedExpiresAt) ? $claimedExpiresAt->toIso8601String() : $claimedExpiresAt)
                : null,
            'required_bookings' => $requiredBookings,
            'completed_bookings' => $completedBookings,
            'required_spent' => $requiredSpent,
            'total_spent' => $totalSpent,
            'requires_verified_email' => $requiresVerifiedEmail,
            'email_verified' => $emailVerified,
            'unmet' => $unmet,
        ];
    }
}