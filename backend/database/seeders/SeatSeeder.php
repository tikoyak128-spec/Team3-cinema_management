<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SeatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rows = ['A', 'B', 'C', 'D', 'E'];

        $roomNames = ['Room 1', 'Room 2', 'Room 3'];

        foreach ($roomNames as $roomName) {
            $roomId = DB::table('rooms')->where('name', $roomName)->value('id');

            foreach ($rows as $row) {
                for ($col = 1; $col <= 4; $col++) {
                    $seatNumber = $row . $col;
                    $seatType = 'regular';

                    if ($row === 'D' || $row === 'E') {
                        $seatType = 'vip';
                    }
                    if ($row === 'E' && ($col === 3 || $col === 4)) {
                        $seatType = 'couple';
                    }

                    DB::table('seats')->updateOrInsert(
                        ['room_id' => $roomId, 'seat_number' => $seatNumber],
                        ['seat_type' => $seatType, 'created_at' => now(), 'updated_at' => now()]
                    );
                }
            }
        }
    }
}