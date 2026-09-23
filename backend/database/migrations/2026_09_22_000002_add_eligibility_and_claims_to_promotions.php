<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('promotions', function (Blueprint $table) {
            if (! Schema::hasColumn('promotions', 'min_bookings')) {
                $table->unsignedInteger('min_bookings')->default(0)->after('is_active');
            }
            if (! Schema::hasColumn('promotions', 'min_spent')) {
                $table->decimal('min_spent', 10, 2)->default(0)->after('min_bookings');
            }
            if (! Schema::hasColumn('promotions', 'require_verified_email')) {
                $table->boolean('require_verified_email')->default(false)->after('min_spent');
            }
        });

        if (! Schema::hasTable('promotion_claims')) {
            Schema::create('promotion_claims', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->foreignId('promotion_id')->constrained()->cascadeOnDelete();
                $table->string('discount_code')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();
                $table->unique(['user_id', 'promotion_id']);
            });
        }

        $conditions = [
            'Premium Cheese Popcorn' => [
                'min_bookings' => 1,
                'min_spent' => 0,
                'require_verified_email' => false,
            ],
            'New Cinema Launch Offer' => [
                'min_bookings' => 3,
                'min_spent' => 50,
                'require_verified_email' => false,
            ],
            'Student Weekday Deal' => [
                'min_bookings' => 0,
                'min_spent' => 0,
                'require_verified_email' => true,
            ],
            'Buy 3 Get 1 Free' => [
                'min_bookings' => 5,
                'min_spent' => 0,
                'require_verified_email' => false,
            ],
            'Movie Night Family Pack' => [
                'min_bookings' => 0,
                'min_spent' => 100,
                'require_verified_email' => false,
            ],
        ];

        foreach ($conditions as $title => $condition) {
            DB::table('promotions')->where('title', $title)->update($condition);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('promotion_claims');

        Schema::table('promotions', function (Blueprint $table) {
            foreach (['min_bookings', 'min_spent', 'require_verified_email'] as $column) {
                if (Schema::hasColumn('promotions', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
