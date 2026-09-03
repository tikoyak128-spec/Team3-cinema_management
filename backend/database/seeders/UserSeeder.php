<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'System Admin',
            'email' => 'achannsina@gmail.com',
            'password' => Hash::make('12345678'),
            'role' => 'admin',
            'phone' => '012345678',
        ]);

        User::create([
            'name' => 'Cinema Staff',
            'email' => 'anchannsina@gmail.com',
            'password' => Hash::make('12345678'),
            'role' => 'staff',
            'phone' => '012345679',
        ]);

        User::create([
            'name' => 'Sina Customer',
            'email' => 'customer@cinema.com',
            'password' => Hash::make('12345678'),
            'role' => 'customer',
            'phone' => '012345680',
        ]);

        User::create([
            'name' => 'Dara Customer',
            'email' => 'dara@cinema.com',
            'password' => Hash::make('12345678'),
            'role' => 'customer',
            'phone' => '012345681',
        ]);
    }
}