<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Category;

class Movie extends Model
{
    protected $fillable = [
        'category_id',
        'title',
        'description',
        'duration',
        'release_date',
        'poster_url',
        'trailer_url',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
