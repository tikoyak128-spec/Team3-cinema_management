<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Movie;

class Category extends Model
{
    protected $table = 'movie_categories';

    protected $fillable = [
        'name',
        'description',
    ];

    public function movies(): HasMany
    {
        return $this->hasMany(Movie::class, 'movie_category_id');
    }
}