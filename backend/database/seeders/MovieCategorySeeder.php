<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MovieCategorySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('movie_categories')->insertOrIgnore([
            ['id' => 1, 'name' => 'Action', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'Sci-Fi', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'Drama', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}