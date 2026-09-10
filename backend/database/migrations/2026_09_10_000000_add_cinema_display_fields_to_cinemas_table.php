<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cinemas', function (Blueprint $table) {
            $table->string('area')->nullable()->after('location');
            $table->string('hours')->nullable()->after('phone');
            $table->string('tagline')->nullable()->after('image');
            $table->json('features')->nullable()->after('tagline');
        });

        $imagePool = [
            'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=900&h=600&fit=crop',
            'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900&h=600&fit=crop',
            'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=900&h=600&fit=crop',
            'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=900&h=600&fit=crop',
        ];

        $featurePool = [
            ['IMAX', 'Dolby Atmos', 'Recliner Seats'],
            ['Couple Seats', 'Lounge', 'Cafe'],
            ['VIP', '4K Laser', 'Kids Screenings'],
            ['Late Shows', '4K Laser', 'Parking'],
        ];

        $areaRules = [
            'Kampong Cham' => 'Kampong Cham',
            'Kampong Speu' => 'Kampong Speu',
            'Kampong Thom' => 'Kampong Thom',
            'Sihanoukville' => 'Sihanoukville',
            'Battambang' => 'Battambang',
            'Kampot' => 'Kampot',
            'Takéo' => 'Takéo',
            'Kandal' => 'Kandal',
            'Takhmao' => 'Kandal',
            'Prey Veng' => 'Prey Veng',
            'Poipet' => 'Banteay Meanchey',
            'Siem Reap' => 'Siem Reap',
            'Sen Sok' => 'Phnom Penh',
            'Mean Chey' => 'Phnom Penh',
            'AEON' => 'Phnom Penh',
            'Sorya' => 'Phnom Penh',
            'Sky Mall' => 'Phnom Penh',
            'TK' => 'Phnom Penh',
        ];

        $cinemas = DB::table('cinemas')->orderBy('id')->get();
        $idx = 0;
        foreach ($cinemas as $cinema) {
            $area = null;
            foreach ($areaRules as $needle => $value) {
                if (str_contains($cinema->name, $needle)) {
                    $area = $value;
                    break;
                }
            }
            $area = $area ?: 'Phnom Penh';
            $features = $featurePool[$idx % count($featurePool)];

            DB::table('cinemas')->where('id', $cinema->id)->update([
                'area' => $area,
                'hours' => '09:00 – 22:00',
                'tagline' => 'Premium cinema experience in ' . $area . '.',
                'features' => json_encode($features),
                'image' => $cinema->image ?: $imagePool[$idx % count($imagePool)],
                'phone' => $cinema->phone ?: '+855 23 000 0' . str_pad((string) $cinema->id, 3, '0', STR_PAD_LEFT),
            ]);
            $idx++;
        }
    }

    public function down(): void
    {
        Schema::table('cinemas', function (Blueprint $table) {
            $table->dropColumn(['area', 'hours', 'tagline', 'features']);
        });
    }
};