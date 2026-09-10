<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    protected $table = 'cinema_rooms';

    protected $fillable = [
        'cinema_id',
        'name',
        'capacity',
    ];

    public function cinema(): BelongsTo
    {
        return $this->belongsTo(Cinema::class);
    }

    public function seats(): HasMany
    {
        return $this->hasMany(Seat::class, 'cinema_room_id');
    }

    public function showtimes(): HasMany
    {
        return $this->hasMany(Showtime::class, 'cinema_room_id');
    }
}