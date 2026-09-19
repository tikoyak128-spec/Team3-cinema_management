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
            if (! Schema::hasColumn('bookings', 'payment_md5')) {
                $table->string('payment_md5', 32)->nullable()->after('total_amount');
            }
            if (! Schema::hasColumn('bookings', 'payment_qr')) {
                $table->string('payment_qr')->nullable()->after('payment_md5');
            }
            if (! Schema::hasColumn('bookings', 'payment_expires_at')) {
                $table->timestamp('payment_expires_at')->nullable()->after('payment_qr');
            }
            if (! Schema::hasColumn('bookings', 'paid_at')) {
                $table->timestamp('paid_at')->nullable()->after('payment_expires_at');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('bookings')) {
            return;
        }

        Schema::table('bookings', function (Blueprint $table) {
            foreach (['payment_md5', 'payment_qr', 'payment_expires_at', 'paid_at'] as $column) {
                if (Schema::hasColumn('bookings', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};