<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create superuser
        User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@example.com',
            'password' => Hash::make('password'),
            'role' => User::ROLE_SUPERUSER,
        ]);

        // Create HR Admin
        User::create([
            'name' => 'HR Admin',
            'email' => 'hradmin@example.com',
            'password' => Hash::make('password'),
            'role' => User::ROLE_HR_ADMIN,
        ]);

        // Create Supervisor
        User::create([
            'name' => 'Supervisor',
            'email' => 'supervisor@example.com',
            'password' => Hash::make('password'),
            'role' => User::ROLE_SUPERVISOR,
        ]);

        // Create Leader
        User::create([
            'name' => 'Team Leader',
            'email' => 'leader@example.com',
            'password' => Hash::make('password'),
            'role' => User::ROLE_LEADER,
        ]);
    }
}
