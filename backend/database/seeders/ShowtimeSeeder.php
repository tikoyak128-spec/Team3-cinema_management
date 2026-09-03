<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShowtimeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $showtimes = [
            ['movie_title' => 'John Wick: Chapter 4', 'room_name' => 'Room 1', 'start_time' => '2026-09-10 10:00:00', 'end_time' => '2026-09-10 12:49:00', 'price' => 12.50],
            ['movie_title' => 'Deadpool & Wolverine', 'room_name' => 'Room 1', 'start_time' => '2026-09-10 14:00:00', 'end_time' => '2026-09-10 16:08:00', 'price' => 14.00],
            ['movie_title' => 'The Conjuring: Last Rites', 'room_name' => 'Room 1', 'start_time' => '2026-09-10 18:30:00', 'end_time' => '2026-09-10 20:22:00', 'price' => 13.00],
            ['movie_title' => 'John Wick: Chapter 4', 'room_name' => 'Room 1', 'start_time' => '2026-09-11 10:00:00', 'end_time' => '2026-09-11 12:49:00', 'price' => 12.50],

            ['movie_title' => 'Bad Boys: Ride or Die', 'room_name' => 'Room 2', 'start_time' => '2026-09-10 11:00:00', 'end_time' => '2026-09-10 12:55:00', 'price' => 11.00],
            ['movie_title' => 'Furiosa: A Mad Max Saga', 'room_name' => 'Room 2', 'start_time' => '2026-09-10 14:30:00', 'end_time' => '2026-09-10 16:58:00', 'price' => 13.50],
            ['movie_title' => 'Deadpool & Wolverine', 'room_name' => 'Room 2', 'start_time' => '2026-09-10 19:00:00', 'end_time' => '2026-09-10 21:08:00', 'price' => 15.00],
            ['movie_title' => 'The Conjuring: Last Rites', 'room_name' => 'Room 2', 'start_time' => '2026-09-11 11:00:00', 'end_time' => '2026-09-11 12:52:00', 'price' => 12.00],

            ['movie_title' => 'Furiosa: A Mad Max Saga', 'room_name' => 'Room 3', 'start_time' => '2026-09-10 13:00:00', 'end_time' => '2026-09-10 15:28:00', 'price' => 13.50],
            ['movie_title' => 'Bad Boys: Ride or Die', 'room_name' => 'Room 3', 'start_time' => '2026-09-10 20:00:00', 'end_time' => '2026-09-10 21:55:00', 'price' => 11.00],
        ];

        foreach ($showtimes as $showtime) {
            $movieId = DB::table('movies')->where('title', $showtime['movie_title'])->value('id');
            $roomId = DB::table('rooms')->where('name', $showtime['room_name'])->value('id');

            DB::table('showtimes')->updateOrInsert(
                ['movie_id' => $movieId, 'room_id' => $roomId, 'start_time' => $showtime['start_time']],
                ['end_time' => $showtime['end_time'], 'price' => $showtime['price'], 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}