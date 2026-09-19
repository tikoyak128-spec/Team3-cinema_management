<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShowtimeSeeder extends Seeder
{
    public function run(): void
    {
        $showtimes = [
    [
            'movie_title' => 'John Wick: Chapter 4',
            'cinema' => 'Khmer Cinema Downtown',
            'room_name' => 'Room 1',
            'start_time' => '2026-09-20 10:00:00',
            'end_time' => '2026-09-20 12:49:00',
            'price' => '12.50',
            'status' => 'active',
        ],
    [
            'movie_title' => 'Deadpool & Wolverine',
            'cinema' => 'Khmer Cinema Downtown',
            'room_name' => 'Room 1',
            'start_time' => '2026-09-20 14:00:00',
            'end_time' => '2026-09-20 16:08:00',
            'price' => '14.00',
            'status' => 'active',
        ],
    [
            'movie_title' => 'គាស់ផ្នូរ',
            'cinema' => 'Khmer Cinema Downtown',
            'room_name' => 'Room 1',
            'start_time' => '2026-09-20 18:30:00',
            'end_time' => '2026-09-20 20:22:00',
            'price' => '13.00',
            'status' => 'active',
        ],
    [
            'movie_title' => 'John Wick: Chapter 4',
            'cinema' => 'Khmer Cinema Downtown',
            'room_name' => 'Room 1',
            'start_time' => '2026-09-21 10:00:00',
            'end_time' => '2026-09-21 12:49:00',
            'price' => '12.50',
            'status' => 'active',
        ],
    [
            'movie_title' => 'Bad Boys: Ride or Die',
            'cinema' => 'Khmer Cinema AEON Mall',
            'room_name' => 'Room 2',
            'start_time' => '2026-09-20 11:00:00',
            'end_time' => '2026-09-20 12:55:00',
            'price' => '11.00',
            'status' => 'active',
        ],
    [
            'movie_title' => 'Furiosa: A Mad Max Saga',
            'cinema' => 'Khmer Cinema AEON Mall',
            'room_name' => 'Room 2',
            'start_time' => '2026-09-20 14:30:00',
            'end_time' => '2026-09-20 16:58:00',
            'price' => '13.50',
            'status' => 'active',
        ],
    [
            'movie_title' => 'Deadpool & Wolverine',
            'cinema' => 'Khmer Cinema AEON Mall',
            'room_name' => 'Room 2',
            'start_time' => '2026-09-20 19:00:00',
            'end_time' => '2026-09-20 21:08:00',
            'price' => '15.00',
            'status' => 'active',
        ],
    [
            'movie_title' => 'គាស់ផ្នូរ',
            'cinema' => 'Khmer Cinema AEON Mall',
            'room_name' => 'Room 2',
            'start_time' => '2026-09-21 11:00:00',
            'end_time' => '2026-09-21 12:52:00',
            'price' => '12.00',
            'status' => 'active',
        ],
    [
            'movie_title' => 'Furiosa: A Mad Max Saga',
            'cinema' => 'Khmer Cinema AEON Mall',
            'room_name' => 'Room 3',
            'start_time' => '2026-09-20 13:00:00',
            'end_time' => '2026-09-20 15:28:00',
            'price' => '13.50',
            'status' => 'active',
        ],
    [
            'movie_title' => 'Bad Boys: Ride or Die',
            'cinema' => 'Khmer Cinema AEON Mall',
            'room_name' => 'Room 3',
            'start_time' => '2026-09-20 20:00:00',
            'end_time' => '2026-09-20 21:55:00',
            'price' => '11.00',
            'status' => 'active',
        ],
        ];

        foreach ($showtimes as $showtime) {
            $movieId = DB::table('movies')->where('title', $showtime['movie_title'])->value('id');
            $roomId = DB::table('cinema_rooms')
                ->join('cinemas', 'cinemas.id', '=', 'cinema_rooms.cinema_id')
                ->where('cinemas.name', $showtime['cinema'])
                ->where('cinema_rooms.name', $showtime['room_name'])
                ->value('cinema_rooms.id');

            DB::table('showtimes')->updateOrInsert(
                ['movie_id' => $movieId, 'cinema_room_id' => $roomId, 'start_time' => $showtime['start_time']],
                ['end_time' => $showtime['end_time'], 'price' => $showtime['price'], 'status' => $showtime['status'], 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
