<?php

namespace Database\Seeders;

use App\Services\CloudinaryService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MovieSeeder extends Seeder
{
    public function run(): void
    {
        $cloudinary = app(CloudinaryService::class);

        DB::table('movies')->whereIn('title', [
            'Avatar: The Way of Water',
            'Oppenheimer',
        ])->delete();

        $movies = [
            [
                'category_id'   => 1,
                'title'         => 'Avengers: Endgame',
                'description'   => 'After the devastating events of Infinity War, the Avengers assemble once more to reverse Thanos\' snap and restore balance to the universe.',
                'duration'      => 181,
                'release_date'  => '2019-04-26',
                'rating'        => 8.4,
                'poster_src'    => 'https://image.tmdb.org/t/p/w500/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg',
            ],
            [
                'category_id'   => 1,
                'title'         => 'Spider-Man: No Way Home',
                'description'   => 'With his identity revealed, Peter Parker asks Doctor Strange for help, but the spell goes wrong and villains from other universes begin to appear.',
                'duration'      => 148,
                'release_date'  => '2021-12-17',
                'rating'        => 8.2,
                'poster_src'    => 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
            ],
            [
                'category_id'   => 4,
                'title'         => 'Free Guy',
                'description'   => 'A bank teller discovers he is actually a background character in an open-world video game and decides to become the hero of his own story.',
                'duration'      => 115,
                'release_date'  => '2021-08-13',
                'rating'        => 7.1,
                'poster_src'    => 'https://image.tmdb.org/t/p/w500/dxraF0qPr1OEgJk17ltQTO84kQF.jpg',
            ],
            [
                'category_id'   => 5,
                'title'         => 'The Conjuring',
                'description'   => 'Paranormal investigators Ed and Lorraine Warren work to help a family terrorized by a dark presence in their farmhouse.',
                'duration'      => 112,
                'release_date'  => '2013-07-19',
                'rating'        => 7.5,
                'poster_src'    => 'https://image.tmdb.org/t/p/w500/wVYREutTvI2tmxr6ujrHT704wGF.jpg',
            ],
            [
                'category_id'   => 6,
                'title'         => 'Titanic',
                'description'   => 'A young aristocrat falls in love with a penniless artist aboard the ill-fated RMS Titanic in this epic romance.',
                'duration'      => 195,
                'release_date'  => '1997-12-19',
                'rating'        => 7.9,
                'poster_src'    => 'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
            ],
            [
                'category_id'   => 7,
                'title'         => 'Inside Out',
                'description'   => 'Five personified emotions inside a young girl\'s mind try to guide her through a difficult move to a new city.',
                'duration'      => 95,
                'release_date'  => '2015-06-19',
                'rating'        => 8.1,
                'poster_src'    => 'https://image.tmdb.org/t/p/w500/j91LJmcWo16CArFOoapsz84bwxb.jpg',
            ],
            [
                'category_id'   => 2,
                'title'         => 'Interstellar',
                'description'   => 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
                'duration'      => 169,
                'release_date'  => '2014-11-07',
                'rating'        => 8.7,
                'poster_src'    => 'https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',
            ],
            [
                'category_id'   => 2,
                'title'         => 'Avatar',
                'description'   => 'A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.',
                'duration'      => 162,
                'release_date'  => '2009-12-18',
                'rating'        => 8.0,
                'poster_src'    => 'https://image.tmdb.org/t/p/w500/gKY6q7SjCkAU6FqvqWybDYgUKIF.jpg',
            ],
            [
                'category_id'   => 8,
                'title'         => 'Age of Wonders',
                'description'   => 'A young orphan discovers an ancient power that could unite the fractured kingdoms of a dying fantasy world.',
                'duration'      => 140,
                'release_date'  => '2026-09-04',
                'rating'        => null,
                'poster_src'    => 'https://upload.wikimedia.org/wikipedia/en/e/e5/Aowboxart.jpg',
            ],
            [
                'category_id'   => 1,
                'title'         => 'Crimson Tide',
                'description'   => 'When a mutiny brews aboard a nuclear submarine, the officers clash over a launch order for a missile strike.',
                'duration'      => 115,
                'release_date'  => '2026-09-11',
                'rating'        => null,
                'poster_src'    => 'https://m.media-amazon.com/images/M/MV5BNTNhZDk2NmQtNDc3ZC00Nzk3LWFmNTctYTc0OWMyNGM0ZWYyXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
            ],
            [
                'category_id'   => 3,
                'title'         => 'Paper Moon',
                'description'   => 'A charming con man and a young girl who may be his daughter travel the Depression-era South, running their small-time schemes.',
                'duration'      => 107,
                'release_date'  => '2026-09-18',
                'rating'        => null,
                'poster_src'    => 'https://upload.wikimedia.org/wikipedia/en/7/71/Paper-moon_small.jpg',
            ],
            [
                'category_id'   => 2,
                'title'         => 'The Far Horizon',
                'description'   => 'A frontier colony fights to survive after a distress signal reveals a threat lurking beyond the edge of known space.',
                'duration'      => 132,
                'release_date'  => '2026-09-25',
                'rating'        => null,
                'poster_src'    => 'https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p2798_p_v12_al.jpg',
            ],
        ];

        foreach ($movies as $movie) {
            $row = DB::table('movies')->where('title', $movie['title'])->first();

            $isCloudinary = $row && $row->poster && str_contains((string) $row->poster, 'res.cloudinary.com');
            $poster = $movie['poster_src'];

            if ($isCloudinary) {
                $poster = $row->poster;
            } else {
                $mirrored = $cloudinary->uploadImageFromUrl($poster, 'cinema/movies/posters');

                if ($mirrored) {
                    $poster = $mirrored;
                } else {
                    $poster = 'https://placehold.co/300x450/050505/e50914/png?text=Khmer+Cinema';
                }
            }

            DB::table('movies')->updateOrInsert(
                ['title' => $movie['title']],
                [
                    'movie_category_id' => $movie['category_id'],
                    'description'       => $movie['description'],
                    'duration'          => $movie['duration'],
                    'release_date'      => $movie['release_date'],
                    'rating'            => $movie['rating'],
                    'poster'            => $poster,
                    'created_at'        => now(),
                    'updated_at'        => now(),
                ]
            );
        }
    }
}