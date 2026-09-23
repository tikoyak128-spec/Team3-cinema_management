<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShowtimeSeeder extends Seeder
{
    public function run(): void
    {
        $showtimes = [
            ['movie_title' => 'Avengers: Endgame', 'cinema' => 'Khmer Cinema Downtown', 'room_name' => 'Room 1', 'start_time' => '2026-09-25 10:00:00', 'price' => '12.50'],
            ['movie_title' => 'Spider-Man: No Way Home', 'cinema' => 'Khmer Cinema Downtown', 'room_name' => 'Room 2', 'start_time' => '2026-09-25 13:30:00', 'price' => '12.00'],
            ['movie_title' => 'Free Guy', 'cinema' => 'Khmer Cinema AEON Mall', 'room_name' => 'Room 1', 'start_time' => '2026-09-25 14:30:00', 'price' => '11.50'],
            ['movie_title' => 'The Conjuring', 'cinema' => 'Khmer Cinema AEON Mall', 'room_name' => 'Room 2', 'start_time' => '2026-09-25 19:00:00', 'price' => '11.00'],
            ['movie_title' => 'Titanic', 'cinema' => 'Khmer Cinema Taksim Mall', 'room_name' => 'Room 1', 'start_time' => '2026-09-25 18:30:00', 'price' => '13.00'],
            ['movie_title' => 'Inside Out', 'cinema' => 'Khmer Cinema Taksim Mall', 'room_name' => 'Room 2', 'start_time' => '2026-09-26 10:30:00', 'price' => '9.50'],
            ['movie_title' => 'Interstellar', 'cinema' => 'Khmer Cinema Exchange', 'room_name' => 'Room 1', 'start_time' => '2026-09-26 16:00:00', 'price' => '13.50'],
            ['movie_title' => 'Avatar', 'cinema' => 'Khmer Cinema Exchange', 'room_name' => 'Room 2', 'start_time' => '2026-09-26 19:00:00', 'price' => '14.00'],
            ['movie_title' => 'Avengers: Endgame', 'cinema' => 'Khmer Cinema Eden Garden', 'room_name' => 'Room 1', 'start_time' => '2026-09-26 13:00:00', 'price' => '12.00'],
            ['movie_title' => 'Spider-Man: No Way Home', 'cinema' => 'Khmer Cinema Chip Mong 271', 'room_name' => 'Room 1', 'start_time' => '2026-09-26 18:00:00', 'price' => '12.50'],
            ['movie_title' => 'Free Guy', 'cinema' => 'Khmer Cinema Chip Mong 271', 'room_name' => 'Room 2', 'start_time' => '2026-09-27 11:00:00', 'price' => '10.50'],
            ['movie_title' => 'The Conjuring', 'cinema' => 'Khmer Cinema K-Mall', 'room_name' => 'Room 1', 'start_time' => '2026-09-27 19:30:00', 'price' => '10.00'],
            ['movie_title' => 'Titanic', 'cinema' => 'Khmer Cinema Heritage Walk', 'room_name' => 'Room 1', 'start_time' => '2026-09-27 16:30:00', 'price' => '13.50'],
            ['movie_title' => 'Interstellar', 'cinema' => 'Khmer Cinema Downtown', 'room_name' => 'Room 2', 'start_time' => '2026-09-27 20:00:00', 'price' => '13.00'],
            ['movie_title' => 'Inside Out', 'cinema' => 'Khmer Cinema AEON Mall', 'room_name' => 'Room 3', 'start_time' => '2026-09-27 10:30:00', 'price' => '9.50'],
            ['movie_title' => 'Avatar', 'cinema' => 'Khmer Cinema Taksim Mall', 'room_name' => 'Room 2', 'start_time' => '2026-09-28 19:30:00', 'price' => '14.00'],
        ];

        foreach ($showtimes as $showtime) {
            $movie = DB::table('movies')->where('title', $showtime['movie_title'])->first();

            $roomId = DB::table('cinema_rooms')
                ->join('cinemas', 'cinemas.id', '=', 'cinema_rooms.cinema_id')
                ->where('cinemas.name', $showtime['cinema'])
                ->where('cinema_rooms.name', $showtime['room_name'])
                ->value('cinema_rooms.id');

            if (! $movie || ! $roomId) {
                continue;
            }

            $startTime = Carbon::parse($showtime['start_time']);
            $endTime = $startTime->copy()->addMinutes((int) $movie->duration);

            DB::table('showtimes')->updateOrInsert(
                ['movie_id' => $movie->id, 'cinema_room_id' => $roomId, 'start_time' => $showtime['start_time']],
                [
                    'end_time' => $endTime->format('Y-m-d H:i:s'),
                    'price' => $showtime['price'],
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}