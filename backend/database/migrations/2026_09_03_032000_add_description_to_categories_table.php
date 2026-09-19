<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('movie_categories') || Schema::hasColumn('movie_categories', 'description')) {
            return;
        }

        Schema::table('movie_categories', function (Blueprint $table) {
            $table->text('description')->nullable()->after('name');
        });
    }

    public function down(): void
    {
        if (Schema::hasTable('movie_categories') && Schema::hasColumn('movie_categories', 'description')) {
            Schema::table('movie_categories', function (Blueprint $table) {
                $table->dropColumn('description');
            });
        }
    }
};