<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cinemas', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('location');
            $table->string('area')->nullable();
            $table->string('phone')->nullable();
            $table->string('hours')->nullable();
            $table->string('image')->nullable();
            $table->text('description')->nullable();
            $table->string('tagline')->nullable();
            $table->json('features')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cinemas');
    }
};