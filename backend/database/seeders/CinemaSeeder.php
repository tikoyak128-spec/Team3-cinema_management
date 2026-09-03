<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CinemaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cinemas = [
            [
                'name' => 'CinePlex Downtown',
                'location' => '123 Main Street, Downtown City Center',
            ],
            [
                'name' => 'CinePlex Mall',
                'location' => '456 Shopping Boulevard, Westfield Mall, Level 3',
            ],
        ];

        foreach ($cinemas as $cinema) {
            DB::table('cinemas')->updateOrInsert(
                ['name' => $cinema['name']],
                ['location' => $cinema['location'], 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
