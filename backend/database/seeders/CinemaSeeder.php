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
                'image' => 'https://res.cloudinary.com/t1size47/image/upload/v1789789859/cinema/cinemas/pymsgxemw3tauyv6nthf.jpg',
                'description' => null,
                'tagline' => 'Premium cinema experience in Phnom Penh.',
                'features' => '["IMAX","Dolby Atmos","Recliner Seats"]',
            ],
            [
                'name' => 'Khmer Cinema AEON Mall',
                'location' => '456 Shopping Boulevard, Sen Sok, Phnom Penh',
                'area' => 'Phnom Penh',
                'phone' => '+855 23 000 002',
                'hours' => '09:00 – 22:00',
                'image' => 'https://res.cloudinary.com/t1size47/image/upload/v1789789964/cinema/cinemas/xkbzxew9anqk8dgzoot9.jpg',
                'description' => null,
                'tagline' => 'Couple seats, lounge and cafe all under one roof.',
                'features' => '["Couple Seats","Lounge","Cafe"]',
            ],
            [
                'name' => 'Khmer Cinema Taksim Mall',
                'location' => 'Taksim Market, Mao Tse Toung Blvd, Phnom Penh',
                'area' => 'Phnom Penh',
                'phone' => '+855 23 000 003',
                'hours' => '09:30 – 23:30',
                'image' => 'https://res.cloudinary.com/t1size47/image/upload/v1789790621/cinema/cinemas/lwsxh4xx0ei2hchn296t.jpg',
                'description' => null,
                'tagline' => 'Late-night screenings with Dolby Digital surround.',
                'features' => '["Dolby Digital","Late Shows","Food Court"]',
            ],
            [
                'name' => 'Khmer Cinema Exchange',
                'location' => 'Exchange Square, Bosphorus St, BKK1, Phnom Penh',
                'area' => 'Phnom Penh',
                'phone' => '+855 23 000 004',
                'hours' => '10:00 – 22:30',
                'image' => 'https://res.cloudinary.com/t1size47/image/upload/v1789790417/cinema/cinemas/bf3jph1mwholy1hqm0k0.jpg',
                'description' => null,
                'tagline' => 'Premium recliner experience in the heart of BKK1.',
                'features' => '["Recliner Seats","Dolby Atmos","Lounge"]',
            ],
            [
                'name' => 'Khmer Cinema Eden Garden',
                'location' => 'Eden Garden Mall, Riverside, Phnom Penh',
                'area' => 'Phnom Penh',
                'phone' => '+855 23 000 005',
                'hours' => '10:00 – 22:00',
                'image' => 'https://res.cloudinary.com/t1size47/image/upload/v1789790742/cinema/cinemas/couxzi88sovvefoy6qvk.jpg',
                'description' => null,
                'tagline' => 'River-view lounge with premium couple seating.',
                'features' => '["Couple Seats","River View","Cafe"]',
            ],
            [
                'name' => 'Khmer Cinema Chip Mong 271',
                'location' => 'Yothapol Khemarak Phoumin Blvd (271) Phnom Penh, Phnom Penh.',
                'area' => 'Phnom Penh',
                'phone' => '+855 63 000 001',
                'hours' => '10:00 – 22:00',
                'image' => 'https://res.cloudinary.com/t1size47/image/upload/v1789791180/cinema/cinemas/msb1crkm9szyqgomkrbz.jpg',
                'description' => null,
                'tagline' => 'The best of cinema right by Siem Reap riverside.',
                'features' => '["4K Laser","Dolby Atmos","Parking"]',
            ],
            [
                'name' => 'Khmer Cinema K-Mall',
                'location' => 'K-Mall, Phnom Penh',
                'area' => 'Phnom Penh',
                'phone' => '+855 53 000 001',
                'hours' => '10:00 – 22:00',
                'image' => 'https://res.cloudinary.com/t1size47/image/upload/v1789791758/cinema/cinemas/mwevbxgbbzcrfydjv9uj.jpg',
                'description' => null,
                'tagline' => 'Modern cinema in the heart of Phnom Penh',
                'features' => '["4K Projection","Family Friendly","Cafe"]',
            ],
            [
                'name' => 'Khmer Cinema Heritage Walk',
                'location' => 'Heritage Walk, Phnom Penh',
                'area' => 'Phnom Penh',
                'phone' => '+855 34 000 001',
                'hours' => '11:00 – 22:00',
                'image' => 'https://res.cloudinary.com/t1size47/image/upload/v1789795210/cinema/cinemas/rnqyqncdmra20qvz0bxq.jpg',
                'description' => null,
                'tagline' => 'Beachside cinema with relaxed weekend vibes.',
                'features' => '["Late Shows","Parking","Cafe"]',
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
                    'description' => $cinema['description'],
                    'tagline' => $cinema['tagline'],
                    'features' => $cinema['features'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}