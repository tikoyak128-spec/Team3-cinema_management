<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $downtownId = DB::table('cinemas')->where('name', 'CinePlex Downtown')->value('id');
        $mallId = DB::table('cinemas')->where('name', 'CinePlex Mall')->value('id');

        $rooms = [
            ['cinema_id' => $downtownId, 'name' => 'Room 1', 'total_seats' => 20],
            ['cinema_id' => $mallId, 'name' => 'Room 2', 'total_seats' => 20],
            ['cinema_id' => $mallId, 'name' => 'Room 3', 'total_seats' => 20],
        ];

        foreach ($rooms as $room) {
            DB::table('rooms')->updateOrInsert(
                ['cinema_id' => $room['cinema_id'], 'name' => $room['name']],
                ['total_seats' => $room['total_seats'], 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}