<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Action', 'description' => 'High-energy films featuring stunts, fights, chases, and physical feats.'],
            ['name' => 'Comedy', 'description' => 'Films designed to make audiences laugh through humor and wit.'],
            ['name' => 'Horror', 'description' => 'Films intended to frighten, unsettle, and create a sense of dread.'],
            ['name' => 'Drama', 'description' => 'Character-driven stories exploring emotional and relational themes.'],
            ['name' => 'Sci-Fi', 'description' => 'Films exploring futuristic concepts, science, technology, and space.'],
            ['name' => 'Animation', 'description' => 'Films created using animation techniques rather than live action.'],
            ['name' => 'Thriller', 'description' => 'Suspenseful films that keep audiences on the edge of their seats.'],
            ['name' => 'Romance', 'description' => 'Films centered on love stories and romantic relationships.'],
            ['name' => 'Adventure', 'description' => 'Exciting journeys and quests in extraordinary settings.'],
            ['name' => 'Documentary', 'description' => 'Non-fiction films documenting real events, people, or issues.'],
        ];

        foreach ($categories as $category) {
            DB::table('categories')->updateOrInsert(
                ['name' => $category['name']],
                ['description' => $category['description'], 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
