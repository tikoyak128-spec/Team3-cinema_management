<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cinema extends Model
{
    protected $fillable = [
        'name',
        'location',
        'area',
        'phone',
        'hours',
        'image',
        'description',
        'tagline',
        'features',
    ];

    protected $casts = [
        'features' => 'array',
    ];

    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class);
    }
}