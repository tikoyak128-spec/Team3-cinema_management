<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = [
            ['cinema' => 'Khmer Cinema Downtown', 'name' => 'Room 1', 'capacity' => 2, 'total_seats' => 100],
            ['cinema' => 'Khmer Cinema Downtown', 'name' => 'Room 2', 'capacity' => 2, 'total_seats' => 80],
            ['cinema' => 'Khmer Cinema AEON Mall', 'name' => 'Room 1', 'capacity' => 2, 'total_seats' => 90],
            ['cinema' => 'Khmer Cinema AEON Mall', 'name' => 'Room 2', 'capacity' => 2, 'total_seats' => 75],
            ['cinema' => 'Khmer Cinema AEON Mall', 'name' => 'Room 3', 'capacity' => 2, 'total_seats' => 60],
            ['cinema' => 'Khmer Cinema Taksim Mall', 'name' => 'Room 1', 'capacity' => 2, 'total_seats' => 85],
            ['cinema' => 'Khmer Cinema Taksim Mall', 'name' => 'Room 2', 'capacity' => 2, 'total_seats' => 70],
            ['cinema' => 'Khmer Cinema Exchange', 'name' => 'Room 1', 'capacity' => 2, 'total_seats' => 65],
            ['cinema' => 'Khmer Cinema Exchange', 'name' => 'Room 2', 'capacity' => 2, 'total_seats' => 55],
            ['cinema' => 'Khmer Cinema Eden Garden', 'name' => 'Room 1', 'capacity' => 2, 'total_seats' => 70],
            ['cinema' => 'Khmer Cinema Chip Mong 271', 'name' => 'Room 1', 'capacity' => 2, 'total_seats' => 80],
            ['cinema' => 'Khmer Cinema Chip Mong 271', 'name' => 'Room 2', 'capacity' => 2, 'total_seats' => 60],
            ['cinema' => 'Khmer Cinema K-Mall', 'name' => 'Room 1', 'capacity' => 2, 'total_seats' => 60],
            ['cinema' => 'Khmer Cinema Heritage Walk', 'name' => 'Room 1', 'capacity' => 2, 'total_seats' => 75],
        ];

        foreach ($rooms as $room) {
            $cinemaId = DB::table('cinemas')->where('name', $room['cinema'])->value('id');

            if (! $cinemaId) {
                continue;
            }

            DB::table('cinema_rooms')->updateOrInsert(
                ['cinema_id' => $cinemaId, 'name' => $room['name']],
                [
                    'capacity' => $room['capacity'],
                    'total_seats' => $room['total_seats'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}