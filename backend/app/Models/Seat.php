<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Seat extends Model
{
    protected $fillable = [
        'cinema_room_id',
        'seat_number',
        'row',
        'seat_type',
    ];

    protected $casts = [
        'cinema_room_id' => 'integer',
    ];

    public function room()
    {
        return $this->belongsTo(Room::class, 'cinema_room_id');
    }

    public function bookingSeats()
    {
        return $this->hasMany(BookingSeat::class);
    }
}
