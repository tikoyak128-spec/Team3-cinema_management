<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('bookings')) {
            return;
        }

        Schema::table('bookings', function (Blueprint $table) {
            if (! Schema::hasColumn('bookings', 'promotion_id')) {
                $table->foreignId('promotion_id')
                    ->nullable()
                    ->after('showtime_id')
                    ->constrained('promotions')
                    ->nullOnDelete();
            }
            if (! Schema::hasColumn('bookings', 'discount_amount')) {
                $table->decimal('discount_amount', 10, 2)
                    ->nullable()
                    ->after('total_amount');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('bookings')) {
            return;
        }

        Schema::table('bookings', function (Blueprint $table) {
            if (Schema::hasColumn('bookings', 'promotion_id')) {
                $table->dropConstrainedForeignId('promotion_id');
            }
            if (Schema::hasColumn('bookings', 'discount_amount')) {
                $table->dropColumn('discount_amount');
            }
        });
    }
};