<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $table = 'cinema_rooms';

    protected $fillable = [
        'cinema_id',
        'name',
        'capacity',
        'total_seats',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'total_seats' => 'integer',
    ];

    public function cinema()
    {
        return $this->belongsTo(Cinema::class, 'cinema_id');
    }

    public function seats()
    {
        return $this->hasMany(Seat::class, 'cinema_room_id');
    }

    public function showtimes()
    {
        return $this->hasMany(Showtime::class, 'cinema_room_id');
    }
}
