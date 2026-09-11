<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $cinemaRooms = [
            'AMC Empire 25' => [
                ['name' => 'Screen 1 - Standard', 'total_seats' => 60],
                ['name' => 'Screen 2 - Standard', 'total_seats' => 60],
                ['name' => 'Screen 3 - IMAX', 'total_seats' => 80],
                ['name' => 'Screen 4 - Dolby Cinema', 'total_seats' => 40],
            ],
            'Regal LA Live' => [
                ['name' => 'Auditorium 1 - Standard', 'total_seats' => 60],
                ['name' => 'Auditorium 2 - IMAX', 'total_seats' => 60],
                ['name' => 'Auditorium 3 - RPX', 'total_seats' => 60],
            ],
            'Vue Westfield London' => [
                ['name' => 'Screen 1 - Standard', 'total_seats' => 60],
                ['name' => 'Screen 2 - Standard', 'total_seats' => 50],
                ['name' => 'Screen 3 - VIP', 'total_seats' => 60],
            ],
            'CGV Cinema Vietnam' => [
                ['name' => 'Hall 1 - Standard', 'total_seats' => 50],
                ['name' => 'Hall 2 - Starium', 'total_seats' => 50],
                ['name' => 'Hall 3 - Sweetbox', 'total_seats' => 50],
            ],
            'Cinemark Century 16' => [
                ['name' => 'Hall A - Standard', 'total_seats' => 55],
                ['name' => 'Hall B - Standard', 'total_seats' => 55],
                ['name' => 'Hall C - XD', 'total_seats' => 50],
            ],
            'Odeon Cinema Manchester' => [
                ['name' => 'Screen 1 - Standard', 'total_seats' => 60],
                ['name' => 'Screen 2 - iSense', 'total_seats' => 50],
            ],
        ];

        foreach ($cinemaRooms as $cinemaName => $rooms) {
            $cinemaId = DB::table('cinemas')->where('name', $cinemaName)->value('id');

            if (!$cinemaId) {
                continue;
            }

            foreach ($rooms as $room) {
                DB::table('rooms')->updateOrInsert(
                    ['cinema_id' => $cinemaId, 'name' => $room['name']],
                    ['total_seats' => $room['total_seats'], 'created_at' => now(), 'updated_at' => now()]
                );
            }
        }
    }
}
