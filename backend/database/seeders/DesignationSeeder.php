<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DesignationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $designations = [
            'Founder',
            'Co-Founder',
            'CEO',
            'Director',
            'Manager',
            'Developer',
            'Designer',
            'Marketing',
            'Sales',
            'Proprietor',
            'Engineer',
            'Worker',
            'Partner',
            'Investor',
            'Other'
        ];

        foreach ($designations as $designation) {
            \App\Models\Designation::firstOrCreate(['name' => $designation]);
        }
    }
}
