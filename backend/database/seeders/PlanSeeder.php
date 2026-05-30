<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Free Plan',
                'slug' => Str::slug('Free Plan'),
                'price' => 0.00,
                'billing_period' => 'monthly',
                'features' => [
                    '1 Business Card',
                    'Standard Templates',
                    'Basic Support',
                ],
            ],
            [
                'name' => 'Pro Plan',
                'slug' => Str::slug('Pro Plan'),
                'price' => 29.99,
                'billing_period' => 'monthly',
                'features' => [
                    'Unlimited Cards',
                    'Premium Templates',
                    'Custom Domain',
                    'Analytics Dashboard',
                    'Priority Support',
                ],
            ],
            [
                'name' => 'Enterprise Plan',
                'slug' => Str::slug('Enterprise Plan'),
                'price' => 99.99,
                'billing_period' => 'yearly',
                'features' => [
                    'Everything in Pro',
                    'White-label Solution',
                    'Dedicated Account Manager',
                    'API Access',
                    '24/7 Phone Support',
                ],
            ],
        ];

        foreach ($plans as $plan) {
            Plan::firstOrCreate(['slug' => $plan['slug']], $plan);
        }
    }
}
