<?php

namespace Database\Seeders;

use App\Models\Movie;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $customers = User::where('role', 'customer')->inRandomOrder()->limit(5)->get();
        $movies = Movie::inRandomOrder()->limit(8)->get();

        if ($customers->isEmpty() || $movies->isEmpty()) {
            return;
        }

        $comments = [
            'Amazing movie, great seats and sound quality!',
            'Really enjoyed the story and the big screen experience.',
            'The visuals were stunning. Highly recommended.',
            'Good movie, though the room was a bit cold.',
            'Worth the ticket price. Will come back again.',
            'An emotional ride from start to finish.',
            'Great family movie night choice.',
            'The sound system here is incredible.',
        ];

        foreach ($movies as $i => $movie) {
            $customer = $customers->get($i % $customers->count());

            Review::firstOrCreate(
                [
                    'user_id' => $customer->id,
                    'movie_id' => $movie->id,
                ],
                [
                    'rating' => rand(3, 5),
                    'comment' => $comments[$i % count($comments)],
                ]
            );
        }
    }
}