<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    protected $fillable = [
        'icon',
        'tag',
        'title',
        'text',
        'discount',
        'type',
        'price_label',
        'price_amount',
        'expires_days',
        'popular',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'popular' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'expires_days' => 'integer',
    ];
}