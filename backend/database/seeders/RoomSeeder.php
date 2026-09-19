<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $downtownId = DB::table('cinemas')->where('name', 'Khmer Cinema Downtown')->value('id');
        $mallId = DB::table('cinemas')->where('name', 'Khmer Cinema AEON Mall')->value('id');
        $taksimId = DB::table('cinemas')->where('name', 'Khmer Cinema Taksim Mall')->value('id');
        $exchangeId = DB::table('cinemas')->where('name', 'Khmer Cinema Exchange')->value('id');
        $edenId = DB::table('cinemas')->where('name', 'Khmer Cinema Eden Garden')->value('id');
        $siemreapId = DB::table('cinemas')->where('name', 'Khmer Cinema Siem Reap')->value('id');
        $battambangId = DB::table('cinemas')->where('name', 'Khmer Cinema Battambang')->value('id');
        $sihanoukId = DB::table('cinemas')->where('name', 'Khmer Cinema Sihanoukville')->value('id');

        $rooms = [
            ['cinema_id' => $downtownId, 'name' => 'Room 1', 'capacity' => 2, 'total_seats' => 100],
            ['cinema_id' => $downtownId, 'name' => 'Room 2', 'capacity' => 2, 'total_seats' => 80],
            ['cinema_id' => $mallId, 'name' => 'Room 1', 'capacity' => 2, 'total_seats' => 90],
            ['cinema_id' => $mallId, 'name' => 'Room 2', 'capacity' => 2, 'total_seats' => 75],
            ['cinema_id' => $mallId, 'name' => 'Room 3', 'capacity' => 2, 'total_seats' => 60],
            ['cinema_id' => $taksimId, 'name' => 'Room 1', 'capacity' => 2, 'total_seats' => 85],
            ['cinema_id' => $taksimId, 'name' => 'Room 2', 'capacity' => 2, 'total_seats' => 70],
            ['cinema_id' => $exchangeId, 'name' => 'Room 1', 'capacity' => 2, 'total_seats' => 65],
            ['cinema_id' => $exchangeId, 'name' => 'Room 2', 'capacity' => 2, 'total_seats' => 55],
            ['cinema_id' => $edenId, 'name' => 'Room 1', 'capacity' => 2, 'total_seats' => 70],
            ['cinema_id' => $siemreapId, 'name' => 'Room 1', 'capacity' => 2, 'total_seats' => 80],
            ['cinema_id' => $siemreapId, 'name' => 'Room 2', 'capacity' => 2, 'total_seats' => 60],
            ['cinema_id' => $battambangId, 'name' => 'Room 1', 'capacity' => 2, 'total_seats' => 60],
            ['cinema_id' => $sihanoukId, 'name' => 'Room 1', 'capacity' => 2, 'total_seats' => 75],
        ];

        foreach ($rooms as $room) {
            DB::table('cinema_rooms')->updateOrInsert(
                ['cinema_id' => $room['cinema_id'], 'name' => $room['name']],
                ['capacity' => $room['capacity'], 'total_seats' => $room['total_seats'], 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}