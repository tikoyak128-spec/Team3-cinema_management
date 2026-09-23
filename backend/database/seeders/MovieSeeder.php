<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MovieSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('movies')->insert([
            [
                'title'       => 'Avatar: The Way of Water',
                'description' => 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora.',
                'duration'    => 192,
                'genre'       => 'Action / Sci-Fi',
                'poster'      => 'https://image.tmdb.org/t/p/w500/t6HIqrRAclO2C1308A3uz3G3130.jpg',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'title'       => 'Oppenheimer',
                'description' => 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
                'duration'    => 180,
                'genre'       => 'Biography / Drama',
                'poster'      => 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGvC23e42Yq.jpg',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ]);
    }
}