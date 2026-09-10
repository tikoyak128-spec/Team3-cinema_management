<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Seat extends Model
{
    protected $fillable = [
        'cinema_room_id',
        'seat_number',
        'row',
        'seat_type',
    ];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'cinema_room_id');
    }
}