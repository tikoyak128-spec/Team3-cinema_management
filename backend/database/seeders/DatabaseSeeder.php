<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            MovieCategorySeeder::class, // Seed categories first
            MovieSeeder::class,         // Seed movies second
            CinemaSeeder::class,        // Seed cinemas
            RoomSeeder::class,          // Seed rooms per cinema
            SeatSeeder::class,          // Seed seats per room
            ShowtimeSeeder::class,      // Seed showtimes last (needs movies + rooms)
        ]);
    }
}