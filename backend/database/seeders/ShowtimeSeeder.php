<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShowtimeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('showtimes')->delete();

        $movies = DB::table('movies')->get(['id', 'duration'])->toArray();
        $rooms = DB::table('rooms')->orderBy('id')->get(['id', 'name'])->toArray();

        if (count($movies) === 0 || count($rooms) === 0) {
            return;
        }

        $timeSlots = [
            ['time' => '09:00', 'price_multiplier' => 1.0],
            ['time' => '11:30', 'price_multiplier' => 1.0],
            ['time' => '14:00', 'price_multiplier' => 1.1],
            ['time' => '16:30', 'price_multiplier' => 1.2],
            ['time' => '19:00', 'price_multiplier' => 1.35],
            ['time' => '21:30', 'price_multiplier' => 1.5],
        ];

        $roomPricingKeywords = [
            'IMAX' => 18.00,
            'Dolby' => 20.00,
            'iSense' => 17.00,
            'Starium' => 16.00,
            'Sweetbox' => 15.00,
            'VIP' => 16.00,
            'XD' => 17.00,
        ];

        $movieCount = count($movies);
        $roomCount = count($rooms);
        $showtimesPerDay = [7, 8, 7, 8, 7, 8, 5];

        $totalInserted = 0;
        $movieIndex = 0;
        $roomIndex = 0;

        for ($day = 0; $day < count($showtimesPerDay) && $totalInserted < 50; $day++) {
            $date = now()->addDays($day)->format('Y-m-d');
            $slotsToday = $timeSlots;

            for ($s = 0; $s < $showtimesPerDay[$day] && $totalInserted < 50; $s++) {
                $slot = $slotsToday[$s % count($slotsToday)];
                $movie = $movies[$movieIndex % $movieCount];
                $room = $rooms[$roomIndex % $roomCount];

                $basePrice = 11.50;
                foreach ($roomPricingKeywords as $keyword => $premiumPrice) {
                    if (str_contains($room->name, $keyword)) {
                        $basePrice = $premiumPrice;
                        break;
                    }
                }
                $price = round($basePrice * $slot['price_multiplier'], 2);

                $startDateTime = $date . ' ' . $slot['time'];
                $endDateTime = date(
                    'Y-m-d H:i:s',
                    strtotime($startDateTime) + (int) $movie->duration * 60
                );

                DB::table('showtimes')->insert([
                    'movie_id' => $movie->id,
                    'room_id' => $room->id,
                    'start_time' => $startDateTime,
                    'end_time' => $endDateTime,
                    'price' => $price,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $totalInserted++;
                $movieIndex++;
                $roomIndex++;
            }
        }
    }
}