<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cinema_room_id')->constrained('cinema_rooms')->cascadeOnDelete();
            $table->string('seat_number');
            $table->string('row')->nullable();
            $table->enum('seat_type', ['regular', 'vip', 'couple'])->default('regular');
            $table->unique(['cinema_room_id', 'seat_number']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seats');
    }
};