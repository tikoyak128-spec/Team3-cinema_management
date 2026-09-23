<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('promotions', 'discount_code')) {
            Schema::table('promotions', function (Blueprint $table) {
                $table->string('discount_code')->nullable()->after('discount');
            });
        }

        $codes = [
            'POP20' => [
                'name' => 'Premium Cheese Popcorn 20% Off',
                'description' => 'Show this code at checkout to claim the Premium Cheese Popcorn deal.',
                'type' => 'percent',
                'value' => 20,
            ],
            'LAUNCH50' => [
                'name' => 'New Cinema Launch Offer 50% Off',
                'description' => 'Apply this code at checkout for the New Cinema Launch special rate.',
                'type' => 'percent',
                'value' => 50,
            ],
            'STUDENT30' => [
                'name' => 'Student Weekday Deal 30% Off',
                'description' => 'Apply this code at checkout for the Student Weekday Deal.',
                'type' => 'percent',
                'value' => 30,
            ],
            'B3G1FREE' => [
                'name' => 'Buy 3 Get 1 Free',
                'description' => 'Buy three tickets, get the fourth free.',
                'type' => 'percent',
                'value' => 25,
            ],
            'FAMILY25' => [
                'name' => 'Movie Night Family Pack 25% Off',
                'description' => 'Apply this code at checkout for the Family Bundle pack.',
                'type' => 'percent',
                'value' => 25,
            ],
        ];

        foreach ($codes as $code => $def) {
            DB::table('discounts')->updateOrInsert(
                ['code' => $code],
                array_merge($def, [
                    'min_amount' => null,
                    'max_discount' => '25.00',
                    'starts_at' => now(),
                    'ends_at' => now()->addMonths(3),
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        $map = [
            'Premium Cheese Popcorn' => 'POP20',
            'New Cinema Launch Offer' => 'LAUNCH50',
            'Student Weekday Deal' => 'STUDENT30',
            'Buy 3 Get 1 Free' => 'B3G1FREE',
            'Movie Night Family Pack' => 'FAMILY25',
        ];

        foreach ($map as $title => $code) {
            DB::table('promotions')->where('title', $title)->update(['discount_code' => $code]);
        }
    }

    public function down(): void
    {
        $codes = ['POP20', 'LAUNCH50', 'STUDENT30', 'B3G1FREE', 'FAMILY25'];

        DB::table('promotions')->whereIn('discount_code', $codes)->update(['discount_code' => null]);
        DB::table('discounts')->whereIn('code', $codes)->delete();

        if (Schema::hasColumn('promotions', 'discount_code')) {
            Schema::table('promotions', function (Blueprint $table) {
                $table->dropColumn('discount_code');
            });
        }
    }
};