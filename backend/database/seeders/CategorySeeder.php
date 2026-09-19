<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
    [
            'name' => 'Action',
            'description' => 'Fast-paced, high-stakes films filled with fights, chases, and explosions.',
        ],
    [
            'name' => 'Comedy',
            'description' => 'Feel-good films designed to make you laugh out loud.',
        ],
    [
            'name' => 'Horror',
            'description' => 'Spine-chilling stories built to keep you on the edge of your seat.',
        ],
    [
            'name' => 'Science Fiction',
            'description' => 'Groundbreaking stories set in futuristic worlds and distant galaxies.',
        ],
    [
            'name' => 'Romance',
            'description' => 'Heartfelt love stories full of emotion and connection.',
        ],
    [
            'name' => 'Animation',
            'description' => 'Imaginative animated adventures for the whole family.',
        ],
    [
            'name' => 'Fantasy',
            'description' => 'Magical worlds, epic quests, and mythical creatures.',
        ],
    [
            'name' => 'Drama',
            'description' => 'Character-driven stories exploring real emotions and conflicts.',
        ],
        ];

        foreach ($categories as $category) {
            DB::table('movie_categories')->updateOrInsert(
                ['name' => $category['name']],
                ['description' => $category['description'], 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
