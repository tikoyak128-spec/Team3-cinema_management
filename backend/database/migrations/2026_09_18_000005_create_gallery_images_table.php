<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gallery_images', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->string('image')->nullable();
            $table->string('alt')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        DB::table('gallery_images')->insert([
            [
                'title' => 'Premium RealD 3D Auditorium',
                'subtitle' => 'Immersive 3D experience',
                'image' => 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&h=600&fit=crop',
                'alt' => 'Premium 3D auditorium',
                'sort_order' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'IAMX Screen',
                'subtitle' => 'Giant screen, crystal clear sound',
                'image' => 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=600&fit=crop',
                'alt' => 'IAMX screen',
                'sort_order' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Couple Lounge Seats',
                'subtitle' => 'Comfortable together seats',
                'image' => 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=600&fit=crop',
                'alt' => 'Couple lounge seats',
                'sort_order' => 3,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Golden Hour Snacks',
                'subtitle' => 'Fresh popcorn & drinks',
                'image' => 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800&h=600&fit=crop',
                'alt' => 'Popcorn and drinks',
                'sort_order' => 4,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Behind the Scenes',
                'subtitle' => 'Inside our projection room',
                'image' => 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=800&h=600&fit=crop',
                'alt' => 'Projection room',
                'sort_order' => 5,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('gallery_images');
    }
};