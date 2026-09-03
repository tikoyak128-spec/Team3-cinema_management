<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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

    protected $casts = [
        'duration' => 'integer',
        'release_date' => 'date',
        'rating' => 'float',
    ];

    public function category()
    {
        return $this->belongsTo(MovieCategory::class, 'movie_category_id');
    }

    public function showtimes()
    {
        return $this->hasMany(Showtime::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
