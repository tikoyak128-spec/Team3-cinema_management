<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Seat extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'room_id',
        'seat_number',
        'seat_type',
    ];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }
}
