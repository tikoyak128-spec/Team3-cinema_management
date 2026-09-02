<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Users: add auth columns
        Schema::table('users', function (Blueprint $table) {
            $table->string('google_id')->nullable()->after('email');
            $table->string('auth_provider')->default('email')->after('google_id');
            $table->string('otp')->nullable()->after('phone');
            $table->timestamp('otp_expires_at')->nullable()->after('otp');
        });

        // Movie categories: drop the incorrect pivot and recreate as lookup table
        Schema::dropIfExists('movie_categories');
        Schema::create('movie_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        // Movies: add FK, rating, status, rename poster_url to poster
        Schema::table('movies', function (Blueprint $table) {
            $table->foreignId('movie_category_id')->nullable()->after('id')->constrained('movie_categories')->nullOnDelete();
            $table->decimal('rating', 3, 1)->nullable()->after('trailer_url');
            $table->enum('status', ['active', 'inactive'])->default('active')->after('rating');
        });

        // Cinemas: add phone and description
        Schema::table('cinemas', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('location');
            $table->text('description')->nullable()->after('phone');
        });

        // Cinema rooms: add capacity alias
        Schema::table('cinema_rooms', function (Blueprint $table) {
            $table->unsignedInteger('capacity')->default(0)->after('name');
        });

        // Seats: add row column
        Schema::table('seats', function (Blueprint $table) {
            $table->string('row', 10)->nullable()->after('seat_number');
        });

        // Showtimes: add status
        Schema::table('showtimes', function (Blueprint $table) {
            $table->enum('status', ['active', 'inactive'])->default('active')->after('price');
        });

        // Bookings: add booking_code
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('booking_code')->unique()->after('showtime_id');
        });

        // Booking seats: add price
        Schema::table('booking_seats', function (Blueprint $table) {
            $table->decimal('price', 10, 2)->default(0)->after('seat_id');
        });

        // Payments: add payment_code, paid_at, fix status enum
        Schema::table('payments', function (Blueprint $table) {
            $table->string('payment_code')->unique()->nullable()->after('booking_id');
            $table->timestamp('paid_at')->nullable()->after('amount');
        });

        // Tickets table (new)
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booking_seat_id')->constrained('booking_seats')->cascadeOnDelete();
            $table->string('ticket_code')->unique();
            $table->enum('status', ['valid', 'used', 'cancelled'])->default('valid');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');

        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['payment_code', 'paid_at']);
        });

        Schema::table('booking_seats', function (Blueprint $table) {
            $table->dropColumn('price');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('booking_code');
        });

        Schema::table('showtimes', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('seats', function (Blueprint $table) {
            $table->dropColumn('row');
        });

        Schema::table('cinema_rooms', function (Blueprint $table) {
            $table->dropColumn('capacity');
        });

        Schema::table('cinemas', function (Blueprint $table) {
            $table->dropColumn(['phone', 'description']);
        });

        Schema::table('movies', function (Blueprint $table) {
            $table->dropForeign(['movie_category_id']);
            $table->dropColumn(['movie_category_id', 'rating', 'status']);
        });

        // Restore original movie_categories pivot
        Schema::dropIfExists('movie_categories');
        Schema::create('movie_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('movie_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->unique(['movie_id', 'category_id']);
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['google_id', 'auth_provider', 'otp', 'otp_expires_at']);
        });
    }
};
