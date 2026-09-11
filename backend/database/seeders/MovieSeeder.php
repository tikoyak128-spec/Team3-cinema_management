<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MovieSeeder extends Seeder
{
    public function run(): void
    {
        $movies = [
            [
                'category' => 'Action',
                'title' => 'John Wick: Chapter 4',
                'description' => 'With the price on his head ever increasing, legendary hit man John Wick takes his fight against the High Table global as he seeks out the most powerful players in the underworld.',
                'duration' => 169,
                'release_date' => '2023-03-24',
                'poster_url' => 'https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7pg3WfH1p3mD.jpg',
                'trailer_url' => 'https://www.youtube.com/watch?v=qEvGmOUQyZM',
            ],
            [
                'category' => 'Action',
                'title' => 'Deadpool & Wolverine',
                'description' => 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary Deadpool behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit up with an even more reluctant Wolverine.',
                'duration' => 128,
                'release_date' => '2024-07-26',
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
                'release_date' => '2024-06-07',
                'poster_url' => 'https://image.tmdb.org/t/p/w500/oGythE98MYleE6mZlGs5oBGkux1.jpg',
                'trailer_url' => 'https://www.youtube.com/watch?v=leEeUfM00Z8',
            ],
            [
                'category' => 'Action',
                'title' => 'Furiosa: A Mad Max Saga',
                'description' => 'The origin story of the renegade young Furiosa before she teamed up with Mad Max in the post-apocalyptic Wasteland.',
                'duration' => 148,
                'release_date' => '2024-05-24',
                'poster_url' => 'https://image.tmdb.org/t/p/w500/iADOJ8Zymht2JPMoy3R7xceZprc.jpg',
                'trailer_url' => 'https://www.youtube.com/watch?v=XJMuhwVlca4',
            ],
            [
                'category' => 'Drama',
                'title' => 'Oppenheimer',
                'description' => 'The story of American physicist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
                'duration' => 180,
                'release_date' => '2023-07-21',
                'poster_url' => 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
                'trailer_url' => 'https://www.youtube.com/watch?v=uYPbbksJxIg',
            ],
            [
                'category' => 'Sci-Fi',
                'title' => 'Dune: Part Two',
                'description' => 'Paul Atreides unites with the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
                'duration' => 166,
                'release_date' => '2024-03-01',
                'poster_url' => 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nez7.jpg',
                'trailer_url' => 'https://www.youtube.com/watch?v=Way9Dexny3w',
            ],
            [
                'category' => 'Animation',
                'title' => 'Inside Out 2',
                'description' => 'Teenager Riley\'s mind headquarters is undergoing a sudden demolition to make room for something entirely unexpected: new Emotions!',
                'duration' => 100,
                'release_date' => '2024-06-14',
                'poster_url' => 'https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
                'trailer_url' => 'https://www.youtube.com/watch?v=LEjhY15eCx0',
            ],
            [
                'category' => 'Thriller',
                'title' => 'A Quiet Place: Day One',
                'description' => 'A woman named Sam finds herself trapped in New York City during the early stages of an invasion by alien creatures with ultra-sensitive hearing.',
                'duration' => 99,
                'release_date' => '2024-06-28',
                'poster_url' => 'https://image.tmdb.org/t/p/w500/yrpPYKijwdMHyTGIOd1iK1h0Xno.jpg',
                'trailer_url' => 'https://www.youtube.com/watch?v=YPY88p7JzYM',
            ],
            [
                'category' => 'Comedy',
                'title' => 'Despicable Me 4',
                'description' => 'Gru and Lucy welcome a new member to the family, Gru Jr., who is intent on tormenting his dad. But their peaceful existence is short-lived.',
                'duration' => 95,
                'release_date' => '2024-07-03',
                'poster_url' => 'https://image.tmdb.org/t/p/w500/wWba3TaojhK7NdDBR8P3KEF6r0.jpg',
                'trailer_url' => 'https://www.youtube.com/watch?v=VSwYfLXfKQY',
            ],
            [
                'category' => 'Adventure',
                'title' => 'Kingdom of the Planet of the Apes',
                'description' => 'Several generations in the following Caesar\'s reign, apes are now the dominant species and live harmoniously while humans have been reduced to living in the shadows.',
                'duration' => 145,
                'release_date' => '2024-05-10',
                'poster_url' => 'https://image.tmdb.org/t/p/w500/gKkl37BQuKTanygYQG1pyYgLVgf.jpg',
                'trailer_url' => 'https://www.youtube.com/watch?v=OclxTKDqPoQ',
            ],
            [
                'category' => 'Romance',
                'title' => 'Anyone But You',
                'description' => 'After an amazing first date, Bea and Ben\'s fiery attraction turns ice-cold until they find themselves unexpectedly thrust together at a destination wedding in Australia.',
                'duration' => 103,
                'release_date' => '2023-12-22',
                'poster_url' => 'https://image.tmdb.org/t/p/w500/yRt3oFGY3o7Q2oS4VqSxFTRPXiJ.jpg',
                'trailer_url' => 'https://www.youtube.com/watch?v=S-dFaP7tR9o',
            ],
            [
                'category' => 'Action',
                'title' => 'Gladiator II',
                'description' => 'Years after witnessing the death of the revered Maximus at the hands of Marcus Aurelius, Lucius is forced to enter the Colosseum after his home is conquered.',
                'duration' => 148,
                'release_date' => '2024-11-22',
                'poster_url' => 'https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
                'trailer_url' => 'https://www.youtube.com/watch?v=4rgYUipGxR8',
            ],
            [
                'category' => 'Horror',
                'title' => 'Alien: Romulus',
                'description' => 'While scavenging the deep ends of a derelict space station, a group of young space colonizers come face to face with the most terrifying life form in the universe.',
                'duration' => 119,
                'release_date' => '2024-08-16',
                'poster_url' => 'https://image.tmdb.org/t/p/w500/b33nnKl1GSFbao4l3fWDDhTkTtV.jpg',
                'trailer_url' => 'https://www.youtube.com/watch?v=GmAU98kjc1E',
            ],
            [
                'category' => 'Drama',
                'title' => 'The Brutalist',
                'description' => 'A Hungarian-born Jewish architect escapes Europe for the United States, where he struggles to find success while building a new life separated from his wife.',
                'duration' => 215,
                'release_date' => '2024-12-20',
                'poster_url' => 'https://image.tmdb.org/t/p/w500/hF3wwb5aIMBxDzFkzOGCf3PBxDX.jpg',
                'trailer_url' => 'https://www.youtube.com/watch?v=8bCp8HqXn_k',
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
