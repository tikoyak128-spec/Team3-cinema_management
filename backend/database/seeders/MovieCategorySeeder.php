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
            ['id' => 4, 'name' => 'Comedy', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'name' => 'Horror', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 6, 'name' => 'Romance', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 7, 'name' => 'Animation', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 8, 'name' => 'Fantasy', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 9, 'name' => 'Biography', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}