<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cinema_rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cinema_id')->constrained('cinemas')->cascadeOnDelete();
            $table->string('name');
            $table->unsignedInteger('capacity')->default(0);
            $table->unsignedInteger('total_seats')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cinema_rooms');
    }
};