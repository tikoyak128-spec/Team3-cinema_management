<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $users = [
    [
            'name' => 'Channsina',
            'email' => 'anchannsina@gmail.com',
            'password' => '$2y$12$BtC2CPuEjrqqSAEcJlhq2elydvb0X0Z6hvxTTwrPEyXG3AGZMJlsy',
            'role' => 'staff',
            'phone' => '098 765 432',
        ],
    [
            'name' => 'Customer',
            'email' => 'customer@cinema.com',
            'password' => '$2y$12$cjrjWBwbPdZmWooEyYhrQeSFGR.ioLTiufDqxSENEEkllpFyIvoAS',
            'role' => 'customer',
            'phone' => '011 222 333',
        ],
    [
            'name' => 'An Channsina',
            'email' => 'achannsina@gmail.com',
            'password' => '$2y$12$U6zGyo69MrlA7tI7wiDcQOA//YFRBSnchSLpMefgXtsy0loub9ghm',
            'role' => 'admin',
            'phone' => '012345678',
        ],
    [
            'name' => 'Channsina An',
            'email' => 'anchannsina21@gmail.com',
            'password' => '$2y$12$oM/sQ6tGHoM/WOKfyuhP6OklfQA248h9RUGFEoOcFgEeB.K/KUhbu',
            'role' => 'customer',
            'phone' => '0123345665',
        ],
    [
            'name' => 'Admin',
            'email' => 'admin@cinema.com',
            'password' => '$2y$12$/Jibvf.9PPFWKYtROQkkSOocXxl7F4CwAGTKEUAqv74n7FS5CMdSO',
            'role' => 'admin',
            'phone' => '012 345 678',
        ],
    [
            'name' => 'Staff',
            'email' => 'staff@cinema.com',
            'password' => '$2y$12$o190SbTo8cyLB15CNOtc5uC0MRfkComzr37HPV9Q6GsAQ4uc0sZHe',
            'role' => 'staff',
            'phone' => '098 765 432',
        ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(['email' => $user['email']], $user);
        }
    }
}
