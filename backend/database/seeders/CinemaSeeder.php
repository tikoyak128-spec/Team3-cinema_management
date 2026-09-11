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
                'name' => 'AMC Empire 25',
                'location' => '234 West 42nd Street, Times Square, New York, NY 10036',
                'address' => '234 W 42nd St, New York, NY 10036',
                'phone' => '+1 212-398-2563',
                'email' => 'info@amcempire25.com',
                'website' => 'https://www.amctheatres.com',
                'status' => 'active',
                'opening_time' => '09:00',
                'closing_time' => '01:30',
                'description' => 'Premier 25-screen cinema in the heart of Times Square featuring IMAX, Dolby Cinema, and premium large format screens.',
                'image_url' => 'https://image.tmdb.org/t/p/w500/amc-empire-25.jpg',
                'halls' => 4,
                'seats' => 240,
            ],
            [
                'name' => 'Regal LA Live',
                'location' => '1000 West Olympic Boulevard, Los Angeles, CA 90015',
                'address' => '1000 W Olympic Blvd, Los Angeles, CA 90015',
                'phone' => '+1 213-763-3240',
                'email' => 'info@regallalive.com',
                'website' => 'https://www.regmovies.com',
                'status' => 'active',
                'opening_time' => '09:30',
                'closing_time' => '00:00',
                'description' => 'Modern multiplex at LA Live entertainment complex with 4DX immersive experience and luxury recliners.',
                'image_url' => 'https://image.tmdb.org/t/p/w500/regal-la-live.jpg',
                'halls' => 3,
                'seats' => 180,
            ],
            [
                'name' => 'Vue Westfield London',
                'location' => 'Ariel Way, London W12 7GF, United Kingdom',
                'address' => 'Ariel Way, Shepherd\'s Bush, London W12 7GF',
                'phone' => '+44 345 303 5051',
                'email' => 'customercare@vue.com',
                'website' => 'https://www.vue.com',
                'status' => 'active',
                'opening_time' => '08:30',
                'closing_time' => '23:30',
                'description' => 'Premium cinema experience in Westfield London with Digital 3D and Dolby Atmos sound.',
                'image_url' => 'https://image.tmdb.org/t/p/w500/vue-westfield.jpg',
                'halls' => 3,
                'seats' => 170,
            ],
            [
                'name' => 'CGV Cinema Vietnam',
                'location' => 'Floor 5, Vincom Center, 72 Le Thanh Ton, District 1, Ho Chi Minh City',
                'address' => '72 Le Thanh Ton, Ben Nghe, District 1, Ho Chi Minh City',
                'phone' => '+84 28 3936 7890',
                'email' => 'support@cgv.vn',
                'website' => 'https://www.cgv.vn',
                'status' => 'active',
                'opening_time' => '09:00',
                'closing_time' => '23:00',
                'description' => 'South Korea-based premium cinema chain featuring Starium screen and Sweetbox seating.',
                'image_url' => 'https://image.tmdb.org/t/p/w500/cgv-cinema.jpg',
                'halls' => 3,
                'seats' => 150,
            ],
            [
                'name' => 'Cinemark Century 16',
                'location' => '1500 Broadway, Denver, CO 80202',
                'address' => '1500 Broadway, Denver, CO 80202',
                'phone' => '+1 303-534-4433',
                'email' => 'feedback@cinemark.com',
                'website' => 'https://www.cinemark.com',
                'status' => 'active',
                'opening_time' => '09:00',
                'closing_time' => '00:30',
                'description' => 'Family-friendly cinema with XD extreme digital cinema screen and dine-in options.',
                'image_url' => 'https://image.tmdb.org/t/p/w500/cinemark-century.jpg',
                'halls' => 3,
                'seats' => 160,
            ],
            [
                'name' => 'Odeon Cinema Manchester',
                'location' => 'The Printworks, Withy Street, Manchester M4 2BS, UK',
                'address' => 'Withy St, Manchester M4 2BS',
                'phone' => '+44 345 303 5051',
                'email' => 'customercare@odeon.co.uk',
                'website' => 'https://www.odeon.co.uk',
                'status' => 'active',
                'opening_time' => '09:00',
                'closing_time' => '23:00',
                'description' => 'Flagship cinema in Manchester\'s Printworks entertainment venue with iSense screen technology.',
                'image_url' => 'https://image.tmdb.org/t/p/w500/odeon-manchester.jpg',
                'halls' => 2,
                'seats' => 110,
            ],
        ];

        foreach ($cinemas as $cinema) {
            DB::table('cinemas')->updateOrInsert(
                ['name' => $cinema['name']],
                [
                    'location' => $cinema['location'],
                    'address' => $cinema['address'],
                    'phone' => $cinema['phone'],
                    'email' => $cinema['email'],
                    'website' => $cinema['website'],
                    'status' => $cinema['status'],
                    'opening_time' => $cinema['opening_time'],
                    'closing_time' => $cinema['closing_time'],
                    'description' => $cinema['description'],
                    'image_url' => $cinema['image_url'],
                    'halls' => $cinema['halls'],
                    'seats' => $cinema['seats'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
