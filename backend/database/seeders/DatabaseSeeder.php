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
        ]);
    }
}