<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Super Admin
        User::updateOrCreate(
            ['email' => 'devstudiodzone@gmail.com'],
            [
                'name' => 'Deepak Suthar',
                'password' => bcrypt('password'),
                'role' => 'super_admin',
                'status' => 'active',
            ]
        );

        // Create Admin
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        // Create Regular User
        User::updateOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'Regular User',
                'password' => bcrypt('password'),
                'role' => 'user',
                'status' => 'active',
            ]
        );

        // Call Category Seeder
        $this->call(CategorySeeder::class);
        $this->call(PlanSeeder::class);
        $this->call(DesignationSeeder::class);

    }
}
