<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hero_images', function (Blueprint $table) {
            $table->id();
            $table->string('page')->unique();
            $table->string('image');
            $table->timestamps();
        });

        DB::table('hero_images')->insert([
            [
                'page' => 'about',
                'image' => 'https://s.studiobinder.com/wp-content/uploads/2025/05/Film-Lighting-and-Artificial-Lighting-on-Movie-Set-Production-Cast-and-Crew.jpg',
            ],
            [
                'page' => 'services',
                'image' => 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=1200&fit=crop',
            ],
            [
                'page' => 'movies',
                'image' => 'https://images.thedirect.com/media/article_full/disney-2025.jpg',
            ],
            [
                'page' => 'cinemas',
                'image' => 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&h=1200&fit=crop',
            ],
            [
                'page' => 'promotions',
                'image' => 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=1400&h=700&fit=crop',
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('hero_images');
    }
};