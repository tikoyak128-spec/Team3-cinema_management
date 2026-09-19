<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CinemaSeeder extends Seeder
{
    public function run(): void
    {
        $cinemas = [
            [
                'name' => 'Khmer Cinema Downtown',
                'location' => '123 Main Street, Phnom Penh',
                'area' => 'Phnom Penh',
                'phone' => '+855 23 000 001',
                'hours' => '09:00 – 22:00',
                'image' => 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=900&h=600&fit=crop',
                'tagline' => 'Premium cinema experience in Phnom Penh.',
                'features' => json_encode(['IMAX', 'Dolby Atmos', 'Recliner Seats']),
            ],
            [
                'name' => 'Khmer Cinema AEON Mall',
                'location' => '456 Shopping Boulevard, Sen Sok, Phnom Penh',
                'area' => 'Phnom Penh',
                'phone' => '+855 23 000 002',
                'hours' => '09:00 – 22:00',
                'image' => 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900&h=600&fit=crop',
                'tagline' => 'Couple seats, lounge and cafe all under one roof.',
                'features' => json_encode(['Couple Seats', 'Lounge', 'Cafe']),
            ],
            [
                'name' => 'Khmer Cinema Taksim Mall',
                'location' => 'Taksim Market, Mao Tse Toung Blvd, Phnom Penh',
                'area' => 'Phnom Penh',
                'phone' => '+855 23 000 003',
                'hours' => '09:30 – 23:30',
                'image' => 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=900&h=600&fit=crop',
                'tagline' => 'Late-night screenings with Dolby Digital surround.',
                'features' => json_encode(['Dolby Digital', 'Late Shows', 'Food Court']),
            ],
            [
                'name' => 'Khmer Cinema Exchange',
                'location' => 'Exchange Square, Bosphorus St, BKK1, Phnom Penh',
                'area' => 'Phnom Penh',
                'phone' => '+855 23 000 004',
                'hours' => '10:00 – 22:30',
                'image' => 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=900&h=600&fit=crop',
                'tagline' => 'Premium recliner experience in the heart of BKK1.',
                'features' => json_encode(['Recliner Seats', 'Dolby Atmos', 'Lounge']),
            ],
            [
                'name' => 'Khmer Cinema Eden Garden',
                'location' => 'Eden Garden Mall, Riverside, Phnom Penh',
                'area' => 'Phnom Penh',
                'phone' => '+855 23 000 005',
                'hours' => '10:00 – 22:00',
                'image' => 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=900&h=600&fit=crop',
                'tagline' => 'River-view lounge with premium couple seating.',
                'features' => json_encode(['Couple Seats', 'River View', 'Cafe']),
            ],
            [
                'name' => 'Khmer Cinema Siem Reap',
                'location' => 'Old Market Road, Siem Reap',
                'area' => 'Siem Reap',
                'phone' => '+855 63 000 001',
                'hours' => '10:00 – 22:00',
                'image' => 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=900&h=600&fit=crop',
                'tagline' => 'The best of cinema right by Siem Reap riverside.',
                'features' => json_encode(['4K Laser', 'Dolby Atmos', 'Parking']),
            ],
            [
                'name' => 'Khmer Cinema Battambang',
                'location' => 'PS Touch Market Road, Battambang',
                'area' => 'Battambang',
                'phone' => '+855 53 000 001',
                'hours' => '10:00 – 22:00',
                'image' => 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900&h=600&fit=crop',
                'tagline' => 'Modern cinema in the heart of Battambang.',
                'features' => json_encode(['4K Projection', 'Family Friendly', 'Cafe']),
            ],
            [
                'name' => 'Khmer Cinema Sihanoukville',
                'location' => 'Independence Beach Road, Sihanoukville',
                'area' => 'Preah Sihanouk',
                'phone' => '+855 34 000 001',
                'hours' => '11:00 – 22:30',
                'image' => 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=900&h=600&fit=crop',
                'tagline' => 'Beachside cinema with relaxed weekend vibes.',
                'features' => json_encode(['Late Shows', 'Parking', 'Cafe']),
            ],
        ];

        foreach ($cinemas as $cinema) {
            DB::table('cinemas')->updateOrInsert(
                ['name' => $cinema['name']],
                [
                    'location' => $cinema['location'],
                    'area' => $cinema['area'],
                    'phone' => $cinema['phone'],
                    'hours' => $cinema['hours'],
                    'image' => $cinema['image'],
                    'tagline' => $cinema['tagline'],
                    'features' => $cinema['features'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}