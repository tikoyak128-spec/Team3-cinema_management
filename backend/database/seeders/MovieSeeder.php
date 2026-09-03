<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MovieSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $movies = [
            [
                'category' => 'Action',
                'title' => 'John Wick: Chapter 4',
                'description' => 'With the price on his head ever increasing, legendary hit man John Wick takes his fight against the High Table global as he seeks out the most powerful players in the underworld.',
                'duration' => 169,
                'release_date' => '2025-03-24',
                'poster_url' => 'https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7pg3WfH1p3mD.jpg',
                'trailer_url' => 'https://www.youtube.com/watch?v=qEvGmOUQyZM',
            ],
            [
                'category' => 'Action',
                'title' => 'Deadpool & Wolverine',
                'description' => 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary Deadpool behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit up with an even more reluctant Wolverine.',
                'duration' => 128,
                'release_date' => '2025-07-26',
                'poster_url' => 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
                'trailer_url' => 'https://www.youtube.com/watch?v=73_1biulkYk',
            ],
            [
                'category' => 'Horror',
                'title' => 'The Conjuring: Last Rites',
                'description' => 'Paranormal investigators Ed and Lorraine Warren take on one last terrifying case involving a mysterious entity as they face their most dangerous challenge.',
                'duration' => 112,
                'release_date' => '2025-09-05',
                'poster_url' => 'https://image.tmdb.org/t/p/w500/hHdOwbJfNlG2HMGjNbfJP0VB2wI.jpg',
                'trailer_url' => 'https://www.youtube.com/watch?v=YBYXEXx6wao',
            ],
            [
                'category' => 'Action',
                'title' => 'Bad Boys: Ride or Die',
                'description' => 'When their late police captain gets framed, Miami\'s best cops must go on the run to clear his name, uncovering a vast conspiracy in the process.',
                'duration' => 115,
                'release_date' => '2025-06-07',
                'poster_url' => 'https://image.tmdb.org/t/p/w500/oGythE98MYleE6mZlGs5oBGkux1.jpg',
                'trailer_url' => 'https://www.youtube.com/watch?v=leEeUfM00Z8',
            ],
            [
                'category' => 'Action',
                'title' => 'Furiosa: A Mad Max Saga',
                'description' => 'The origin story of the renegade young Furiosa before she teamed up with Mad Max in the post-apocalyptic Wasteland.',
                'duration' => 148,
                'release_date' => '2025-05-24',
                'poster_url' => 'https://image.tmdb.org/t/p/w500/iADOJ8Zymht2JPMoy3R7xceZprc.jpg',
                'trailer_url' => 'https://www.youtube.com/watch?v=XJMuhwVlca4',
            ],
        ];

        foreach ($movies as $movie) {
            $categoryId = DB::table('categories')->where('name', $movie['category'])->value('id');

            DB::table('movies')->updateOrInsert(
                ['title' => $movie['title']],
                [
                    'category_id' => $categoryId,
                    'description' => $movie['description'],
                    'duration' => $movie['duration'],
                    'release_date' => $movie['release_date'],
                    'poster_url' => $movie['poster_url'],
                    'trailer_url' => $movie['trailer_url'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}