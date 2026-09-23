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
                'movie_category_id' => 1,
                'title'             => 'Avatar: The Way of Water',
                'description'       => 'Jake Sully lives with his newfound family formed on Pandora.',
                'duration'          => 192,
                'poster'            => 'https://image.tmdb.org/t/p/w500/t6HIqrRAclO2C1308A3uz3G3130.jpg',
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
            [
                'movie_category_id' => 2,
                'title'             => 'Oppenheimer',
                'description'       => 'The story of American scientist J. Robert Oppenheimer.',
                'duration'          => 180,
                'poster'            => 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGvC23e42Yq.jpg',
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
        ]);
    }
}