<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cinemas', function (Blueprint $table) {
            $table->text('address')->nullable()->after('location');
            $table->string('phone')->nullable()->after('address');
            $table->string('email')->nullable()->after('phone');
            $table->string('website')->nullable()->after('email');
            $table->string('status')->default('active')->after('website');
            $table->time('opening_time')->nullable()->after('status');
            $table->time('closing_time')->nullable()->after('opening_time');
            $table->text('description')->nullable()->after('closing_time');
            $table->string('image_url')->nullable()->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('cinemas', function (Blueprint $table) {
            $table->dropColumn([
                'address',
                'phone',
                'email',
                'website',
                'status',
                'opening_time',
                'closing_time',
                'description',
                'image_url',
            ]);
        });
    }
};