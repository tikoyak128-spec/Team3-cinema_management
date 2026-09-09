<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cinemas', function (Blueprint $table) {
            $table->unsignedInteger('halls')->default(0)->after('status');
            $table->unsignedInteger('seats')->default(0)->after('halls');
        });
    }

    public function down(): void
    {
        Schema::table('cinemas', function (Blueprint $table) {
            $table->dropColumn(['halls', 'seats']);
        });
    }
};