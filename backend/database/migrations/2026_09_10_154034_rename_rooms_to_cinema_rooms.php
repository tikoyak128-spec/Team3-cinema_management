<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('rooms')) {
            return;
        }

        Schema::rename('rooms', 'cinema_rooms');

        Schema::table('showtimes', function (Blueprint $table) {
            if (Schema::hasColumn('showtimes', 'room_id')) {
                $table->renameColumn('room_id', 'cinema_room_id');
            }
        });

        Schema::table('seats', function (Blueprint $table) {
            if (Schema::hasColumn('seats', 'room_id')) {
                $table->renameColumn('room_id', 'cinema_room_id');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('cinema_rooms')) {
            return;
        }

        Schema::table('seats', function (Blueprint $table) {
            if (Schema::hasColumn('seats', 'cinema_room_id')) {
                $table->renameColumn('cinema_room_id', 'room_id');
            }
        });

        Schema::table('showtimes', function (Blueprint $table) {
            if (Schema::hasColumn('showtimes', 'cinema_room_id')) {
                $table->renameColumn('cinema_room_id', 'room_id');
            }
        });

        Schema::rename('cinema_rooms', 'rooms');
    }
};
