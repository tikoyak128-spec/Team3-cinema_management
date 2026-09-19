<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            if (! Schema::hasColumn('bookings', 'discount_id')) {
                $table->foreignId('discount_id')
                    ->nullable()
                    ->after('promotion_id')
                    ->constrained('discounts')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            if (Schema::hasColumn('bookings', 'discount_id')) {
                $table->dropConstrainedForeignId('discount_id');
            }
        });
    }
};