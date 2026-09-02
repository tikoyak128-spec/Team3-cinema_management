<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    protected $fillable = [
        'booking_id',
        'booking_seat_id',
        'ticket_code',
        'status',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function bookingSeat()
    {
        return $this->belongsTo(BookingSeat::class);
    }
}
