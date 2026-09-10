<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->string('icon')->default('faTicket');
            $table->string('tag');
            $table->string('title');
            $table->text('text');
            $table->string('discount');
            $table->string('type')->default('tickets');
            $table->string('price_label')->default('Starting at');
            $table->string('price_amount')->default('$3.50');
            $table->unsignedSmallInteger('expires_days')->default(7);
            $table->boolean('popular')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};