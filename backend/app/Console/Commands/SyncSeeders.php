<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncSeeders extends Command
{
    protected $signature = 'seeders:sync
        {--only=* : Only sync these seeders: categories, movies, cinemas, rooms, showtimes, promotions, users}';

    protected $description = 'Regenerate database/seeders from the live admin-managed database so db:seed reproduces the admin panel data.';

    public function handle(): int
    {
        $only = array_map('strtolower', $this->option('only') ?: []);
        $all = count($only) === 0;

        $targets = [
            'categories' => [fn () => $this->syncCategories(), 'CategorySeeder.php'],
            'movies' => [fn () => $this->syncMovies(), 'MovieSeeder.php'],
            'cinemas' => [fn () => $this->syncCinemas(), 'CinemaSeeder.php'],
            'rooms' => [fn () => $this->syncRooms(), 'RoomSeeder.php'],
            'showtimes' => [fn () => $this->syncShowtimes(), 'ShowtimeSeeder.php'],
            'promotions' => [fn () => $this->syncPromotions(), 'PromotionSeeder.php'],
            'users' => [fn () => $this->syncUsers(), 'UserSeeder.php'],
        ];

        $failed = false;

        foreach ($targets as $name => [$callback, $file]) {
            if (! $all && ! in_array($name, $only, true)) {
                continue;
            }

            try {
                $callback();
                $this->info("Synced {$file}");
            } catch (\Throwable $e) {
                $failed = true;
                $this->error("Failed to sync {$file}: {$e->getMessage()}");
            }
        }

        return $failed ? self::FAILURE : self::SUCCESS;
    }

    private function syncCategories(): void
    {
        $rows = DB::table('movie_categories')
            ->orderBy('id')
            ->get(['name', 'description'])
            ->map(fn ($r) => ['name' => $r->name, 'description' => $r->description])
            ->all();

        $body = <<<'PHP'
        $categories = [
    __DATA__
        ];

        foreach ($categories as $category) {
            DB::table('movie_categories')->updateOrInsert(
                ['name' => $category['name']],
                ['description' => $category['description'], 'created_at' => now(), 'updated_at' => now()]
            );
        }
PHP;

        $this->writeFile('CategorySeeder.php', $this->dbTemplate('CategorySeeder', $body, $rows));
    }

    private function syncMovies(): void
    {
        $categoryIds = DB::table('movie_categories')->pluck('name', 'id');

        $rows = DB::table('movies')
            ->orderBy('id')
            ->get()
            ->map(function ($m) use ($categoryIds) {
                return [
                    'category' => $categoryIds[$m->movie_category_id] ?? null,
                    'title' => $m->title,
                    'description' => $m->description,
                    'duration' => $m->duration,
                    'release_date' => $m->release_date,
                    'poster' => $m->poster,
                    'trailer_url' => $m->trailer_url,
                    'rating' => $m->rating,
                    'status' => $m->status,
                ];
            })
            ->all();

        $body = <<<'PHP'
        $movies = [
    __DATA__
        ];

        foreach ($movies as $movie) {
            $categoryId = DB::table('movie_categories')->where('name', $movie['category'])->value('id');

            DB::table('movies')->updateOrInsert(
                ['title' => $movie['title']],
                [
                    'movie_category_id' => $categoryId,
                    'description' => $movie['description'],
                    'duration' => $movie['duration'],
                    'release_date' => $movie['release_date'],
                    'poster' => $movie['poster'],
                    'trailer_url' => $movie['trailer_url'],
                    'rating' => $movie['rating'],
                    'status' => $movie['status'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
PHP;

        $this->writeFile('MovieSeeder.php', $this->dbTemplate('MovieSeeder', $body, $rows));
    }

    private function syncCinemas(): void
    {
        $rows = DB::table('cinemas')
            ->orderBy('id')
            ->get()
            ->map(function ($c) {
                return [
                    'name' => $c->name,
                    'location' => $c->location,
                    'area' => $c->area,
                    'phone' => $c->phone,
                    'hours' => $c->hours,
                    'image' => $c->image,
                    'description' => $c->description,
                    'tagline' => $c->tagline,
                    'features' => json_encode(json_decode((string) $c->features, true) ?: [], JSON_UNESCAPED_SLASHES),
                ];
            })
            ->all();

        $body = <<<'PHP'
        $cinemas = [
    __DATA__
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
PHP;

        $this->writeFile('CinemaSeeder.php', $this->dbTemplate('CinemaSeeder', $body, $rows));
    }

    private function syncRooms(): void
    {
        $cinemaNames = DB::table('cinemas')->pluck('name', 'id');

        $rows = DB::table('cinema_rooms')
            ->orderBy('id')
            ->get()
            ->map(function ($r) use ($cinemaNames) {
                return [
                    'cinema' => $cinemaNames[$r->cinema_id] ?? null,
                    'name' => $r->name,
                    'capacity' => $r->capacity,
                    'total_seats' => $r->total_seats,
                ];
            })
            ->all();

        $body = <<<'PHP'
        $rooms = [
    __DATA__
        ];

        foreach ($rooms as $room) {
            $cinemaId = DB::table('cinemas')->where('name', $room['cinema'])->value('id');

            DB::table('cinema_rooms')->updateOrInsert(
                ['cinema_id' => $cinemaId, 'name' => $room['name']],
                ['capacity' => $room['capacity'], 'total_seats' => $room['total_seats'], 'created_at' => now(), 'updated_at' => now()]
            );
        }
PHP;

        $this->writeFile('RoomSeeder.php', $this->dbTemplate('RoomSeeder', $body, $rows));
    }

    private function syncShowtimes(): void
    {
        $movieTitles = DB::table('movies')->pluck('title', 'id');

        $roomNames = DB::table('cinema_rooms')
            ->join('cinemas', 'cinemas.id', '=', 'cinema_rooms.cinema_id')
            ->pluck('cinema_rooms.name', 'cinema_rooms.id');

        $cinemaNames = DB::table('cinema_rooms')
            ->join('cinemas', 'cinemas.id', '=', 'cinema_rooms.cinema_id')
            ->pluck('cinemas.name', 'cinema_rooms.id');

        $rows = DB::table('showtimes')
            ->orderBy('id')
            ->get()
            ->map(function ($s) use ($movieTitles, $roomNames, $cinemaNames) {
                return [
                    'movie_title' => $movieTitles[$s->movie_id] ?? null,
                    'cinema' => $cinemaNames[$s->cinema_room_id] ?? null,
                    'room_name' => $roomNames[$s->cinema_room_id] ?? null,
                    'start_time' => $s->start_time,
                    'end_time' => $s->end_time,
                    'price' => $s->price,
                    'status' => $s->status,
                ];
            })
            ->all();

        $body = <<<'PHP'
        $showtimes = [
    __DATA__
        ];

        foreach ($showtimes as $showtime) {
            $movieId = DB::table('movies')->where('title', $showtime['movie_title'])->value('id');
            $roomId = DB::table('cinema_rooms')
                ->join('cinemas', 'cinemas.id', '=', 'cinema_rooms.cinema_id')
                ->where('cinemas.name', $showtime['cinema'])
                ->where('cinema_rooms.name', $showtime['room_name'])
                ->value('cinema_rooms.id');

            DB::table('showtimes')->updateOrInsert(
                ['movie_id' => $movieId, 'cinema_room_id' => $roomId, 'start_time' => $showtime['start_time']],
                ['end_time' => $showtime['end_time'], 'price' => $showtime['price'], 'status' => $showtime['status'], 'created_at' => now(), 'updated_at' => now()]
            );
        }
PHP;

        $this->writeFile('ShowtimeSeeder.php', $this->dbTemplate('ShowtimeSeeder', $body, $rows));
    }

    private function syncPromotions(): void
    {
        $rows = DB::table('promotions')
            ->orderBy('id')
            ->get()
            ->map(function ($p) {
                return [
                    'icon' => $p->icon,
                    'tag' => $p->tag,
                    'title' => $p->title,
                    'text' => $p->text,
                    'discount' => $p->discount,
                    'type' => $p->type,
                    'price_label' => $p->price_label,
                    'price_amount' => $p->price_amount,
                    'expires_days' => $p->expires_days,
                    'popular' => (bool) $p->popular,
                    'sort_order' => $p->sort_order,
                    'is_active' => (bool) $p->is_active,
                ];
            })
            ->all();

        $body = <<<'PHP'
        $promotions = [
    __DATA__
        ];

        foreach ($promotions as $promo) {
            Promotion::updateOrCreate(['title' => $promo['title']], $promo);
        }
PHP;

        $this->writeFile('PromotionSeeder.php', $this->modelTemplate('PromotionSeeder', 'Promotion', $body, $rows));
    }

    private function syncUsers(): void
    {
        $rows = DB::table('users')
            ->orderBy('id')
            ->get(['name', 'email', 'password', 'role', 'phone'])
            ->map(function ($u) {
                return [
                    'name' => $u->name,
                    'email' => $u->email,
                    'password' => $u->password,
                    'role' => $u->role,
                    'phone' => $u->phone,
                ];
            })
            ->all();

        $body = <<<'PHP'
        $users = [
    __DATA__
        ];

        foreach ($users as $user) {
            User::updateOrCreate(['email' => $user['email']], $user);
        }
PHP;

        $this->writeFile('UserSeeder.php', $this->modelTemplate('UserSeeder', 'User', $body, $rows));
    }

    private function dbTemplate(string $class, string $body, array $rows): string
    {
        $header = <<<PHP
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class {$class} extends Seeder
{
    public function run(): void
    {
PHP;

        $footer = "    }\n}\n";

        return $header . "\n" . $this->withData($body, $rows) . "\n" . $footer;
    }

    private function modelTemplate(string $class, string $model, string $body, array $rows): string
    {
        $header = <<<PHP
<?php

namespace Database\Seeders;

use App\Models\\{$model};
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class {$class} extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
PHP;

        $footer = "    }\n}\n";

        return $header . "\n" . $this->withData($body, $rows) . "\n" . $footer;
    }

    private function withData(string $body, array $rows): string
    {
        if ($rows === []) {
            return str_replace('    __DATA__', '        //', $body);
        }

        $data = '';

        foreach ($rows as $row) {
            $data .= str_repeat(' ', 4) . $this->phpValue($row, 2) . ",\n";
        }

        return str_replace("    __DATA__", rtrim($data, "\n"), $body);
    }

    private function phpValue(mixed $value, int $indent): string
    {
        if (is_array($value)) {
            if ($value === []) {
                return '[]';
            }

            $parts = [];

            foreach ($value as $key => $item) {
                $k = is_int($key) ? (string) $key : var_export($key, true);
                $parts[] = str_repeat(' ', ($indent + 1) * 4) . $k . ' => ' . $this->phpValue($item, $indent + 1) . ',';
            }

            return "[\n" . implode("\n", $parts) . "\n" . str_repeat(' ', $indent * 4) . ']';
        }

        return var_export($value, true);
    }

    private function writeFile(string $name, string $content): void
    {
        $path = database_path('seeders') . DIRECTORY_SEPARATOR . $name;
        file_put_contents($path, $content);
    }
}