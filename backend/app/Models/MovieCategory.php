<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MovieCategory extends Model
{
    protected $table = 'movie_categories';

    protected $fillable = ['name'];

    public function movies()
    {
        return $this->hasMany(Movie::class, 'movie_category_id');
    }
}
