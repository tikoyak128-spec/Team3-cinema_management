<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Category;

class Movie extends Model
{
    protected $fillable = [
        'movie_category_id',
        'title',
        'description',
        'duration',
        'release_date',
        'poster',
        'trailer_url',
        'rating',
        'status',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'movie_category_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}