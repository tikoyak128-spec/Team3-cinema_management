<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin',
                'email' => 'admin@cinema.com',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'phone' => '0123456789',
            ],
            [
                'name' => 'Staff',
                'email' => 'staff@cinema.com',
                'password' => bcrypt('password'),
                'role' => 'staff',
                'phone' => '0987654321',
            ],
            [
                'name' => 'Customer',
                'email' => 'customer@cinema.com',
                'password' => bcrypt('password'),
                'role' => 'customer',
                'phone' => '0112233445',
            ],
        ];

        foreach ($users as $user) {
            DB::table('users')->updateOrInsert(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'password' => $user['password'],
                    'role' => $user['role'],
                    'phone' => $user['phone'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
