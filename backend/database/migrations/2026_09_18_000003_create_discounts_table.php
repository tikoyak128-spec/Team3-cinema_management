<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('discounts', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('type')->default('percent'); // percent | fixed
            $table->decimal('value', 10, 2);
            $table->decimal('min_amount', 10, 2)->nullable();
            $table->decimal('max_discount', 10, 2)->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        DB::table('discounts')->insert([
            [
                'code' => 'WELCOME20',
                'name' => 'New Member 20% Off',
                'description' => 'Welcome discount for new members on their first booking.',
                'type' => 'percent',
                'value' => 20,
                'min_amount' => 20,
                'max_discount' => 15,
                'starts_at' => now(),
                'ends_at' => now()->addMonths(3),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'WEEKEND5',
                'name' => 'Weekend Combo Saver',
                'description' => 'Flat discount applied to weekend combo purchases.',
                'type' => 'fixed',
                'value' => 5,
                'min_amount' => null,
                'max_discount' => null,
                'starts_at' => now(),
                'ends_at' => now()->addMonths(6),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'FLASH25',
                'name' => 'Flash Sale 25% Off',
                'description' => 'Limited time flash sale on all tickets.',
                'type' => 'percent',
                'value' => 25,
                'min_amount' => 10,
                'max_discount' => 25,
                'starts_at' => now()->subDays(2),
                'ends_at' => now()->addDays(7),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('discounts');
    }
};