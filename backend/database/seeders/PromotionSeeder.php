<?php

namespace Database\Seeders;

use App\Models\Promotion;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PromotionSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $promotions = [
            [
                'icon' => 'faBowlFood',
                'tag' => 'Food & Beverage',
                'title' => 'Premium Cheese Popcorn',
                'text' => 'Cheese lovers, get ready for our special new snack — gourmet cheese popcorn made in-house every day.',
                'discount' => '20%',
                'type' => 'snacks',
                'price_label' => 'Only',
                'price_amount' => '$2.00',
                'expires_days' => 5,
                'popular' => false,
                'sort_order' => 2,
            ],
            [
                'icon' => 'faTicket',
                'tag' => 'Launch Special',
                'title' => 'New Cinema Launch Offer',
                'text' => 'Enjoy exclusive launch rates at our brand new location — regular 2D starting from $3.50 only.',
                'discount' => '50%',
                'type' => 'tickets',
                'price_label' => 'Starting at',
                'price_amount' => '$3.50',
                'expires_days' => 3,
                'popular' => true,
                'sort_order' => 1,
            ],
            [
                'icon' => 'faGraduationCap',
                'tag' => 'Student',
                'title' => 'Student Weekday Deal',
                'text' => 'Show your student ID every Mon–Thu and unlock heavily discounted tickets all day long.',
                'discount' => '30%',
                'type' => 'tickets',
                'price_label' => 'Starting at',
                'price_amount' => '$2.50',
                'expires_days' => 7,
                'popular' => false,
                'sort_order' => 3,
            ],
            [
                'icon' => 'faTicket',
                'tag' => 'Combo Deal',
                'title' => 'Buy 3 Get 1 Free',
                'text' => 'Bring the whole crew — buy three tickets and get the fourth completely free on any showtime.',
                'discount' => 'FREE',
                'type' => 'combo',
                'price_label' => 'Bundle',
                'price_amount' => '$12.00',
                'expires_days' => 6,
                'popular' => false,
                'sort_order' => 4,
            ],
            [
                'icon' => 'faBowlFood',
                'tag' => 'Family Bundle',
                'title' => 'Movie Night Family Pack',
                'text' => '2 tickets + large popcorn + 2 drinks + candy box. Everything you need for the perfect family movie night.',
                'discount' => '25%',
                'type' => 'combo',
                'price_label' => 'Bundle',
                'price_amount' => '$15.00',
                'expires_days' => 4,
                'popular' => false,
                'sort_order' => 5,
            ],
            [
                'icon' => 'faTicket',
                'tag' => 'Members Only',
                'title' => 'Loyalty+ Double Points',
                'text' => 'Members earn double reward points on every ticket and snack purchase this whole month.',
                'discount' => '2X',
                'type' => 'loyalty',
                'price_label' => 'Points',
                'price_amount' => '2X',
                'expires_days' => 8,
                'popular' => false,
                'sort_order' => 6,
            ],
        ];

        foreach ($promotions as $promo) {
            Promotion::updateOrCreate(['title' => $promo['title']], $promo);
        }
    }
}