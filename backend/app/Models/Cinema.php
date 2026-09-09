<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cinema extends Model
{
    protected $fillable = [
        'name',
        'location',
        'address',
        'phone',
        'email',
        'website',
        'status',
        'halls',
        'seats',
        'opening_time',
        'closing_time',
        'description',
        'image_url',
    ];

    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class);
    }
}
