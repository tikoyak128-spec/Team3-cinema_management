<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cinema extends Model
{
    protected $fillable = [
        'name',
        'location',
        'phone',
        'description',
    ];

    public function rooms()
    {
        return $this->hasMany(Room::class, 'cinema_id');
    }
}
