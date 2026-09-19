<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('bookings') || Schema::hasColumn('bookings', 'payment_method')) {
            return;
        }

        Schema::table('bookings', function (Blueprint $table) {
            $table->string('payment_method', 20)->nullable()->after('total_amount');
        });
    }

    public function down(): void
    {
        if (Schema::hasTable('bookings') && Schema::hasColumn('bookings', 'payment_method')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->dropColumn('payment_method');
            });
        }
    }
};