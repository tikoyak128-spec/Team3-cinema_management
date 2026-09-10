<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('payment_md5', 32)->nullable()->after('total_amount');
            $table->string('payment_qr')->nullable()->after('payment_md5');
            $table->timestamp('payment_expires_at')->nullable()->after('payment_qr');
            $table->timestamp('paid_at')->nullable()->after('payment_expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['payment_md5', 'payment_qr', 'payment_expires_at', 'paid_at']);
        });
    }
};