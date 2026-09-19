<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Booking extends Model
{
    protected $appends = ['currency'];

    public function currency(): Attribute
    {
        return Attribute::make(
            get: fn () => config('services.bakong.currency'),
        );
    }

    protected $fillable = [
        'user_id',
        'showtime_id',
        'promotion_id',
        'discount_id',
        'booking_code',
        'total_amount',
        'discount_amount',
        'payment_method',
        'status',
        'payment_md5',
        'payment_qr',
        'payment_expires_at',
        'paid_at',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function showtime(): BelongsTo
    {
        return $this->belongsTo(Showtime::class);
    }

    public function promotion(): BelongsTo
    {
        return $this->belongsTo(Promotion::class);
    }

    public function discount(): BelongsTo
    {
        return $this->belongsTo(Discount::class);
    }

    public function bookingSeats(): HasMany
    {
        return $this->hasMany(BookingSeat::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }
}
