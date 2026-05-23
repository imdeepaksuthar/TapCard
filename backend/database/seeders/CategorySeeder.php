<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            'Sales' => [
                'B2B Sales',
                'B2C Sales',
                'Field Sales',
                'Inside Sales',
                'Corporate Sales',
                'Account Management',
            ],
            'Marketing' => [
                'Digital Marketing',
                'SEO & SEM',
                'Content Marketing',
                'Brand Management',
                'Product Marketing',
                'Public Relations',
                'Event Management',
            ],
            'Engineering & IT' => [
                'Software Development',
                'Frontend Engineering',
                'Backend Engineering',
                'DevOps',
                'Cybersecurity',
                'Systems Administration',
                'IT Support',
            ],
            'Human Resources' => [
                'Talent Acquisition',
                'Compensation & Benefits',
                'Employee Engagement',
                'Training & Development',
                'HR Operations',
            ],
            'Finance & Accounting' => [
                'Accounting',
                'Auditing',
                'Financial Planning & Analysis',
                'Tax Consulting',
                'Treasury',
            ],
            'Operations' => [
                'Logistics',
                'Supply Chain Management',
                'Procurement',
                'Quality Assurance',
                'Facilities Management',
            ],
            'Executive & Management' => [
                'C-Level Executive',
                'Board Member',
                'VP / Director',
                'Business Development',
            ],
            'Design & Creative' => [
                'UI/UX Design',
                'Graphic Design',
                'Product Design',
                'Art Direction',
                'Animation & Video',
            ],
            'Customer Service & Support' => [
                'Customer Success',
                'Technical Support',
                'Call Center Operations',
                'Customer Experience',
            ],
        ];

        $businesses = [
            'Retail & E-commerce' => [
                'Fashion & Apparel',
                'Consumer Electronics',
                'Grocery & Supermarkets',
                'Home & Furniture',
                'Beauty & Cosmetics',
                'Online Marketplace',
            ],
            'Healthcare & Medical' => [
                'General Practice',
                'Dentistry',
                'Pharmacy',
                'Specialized Medicine',
                'Veterinary Services',
                'Wellness & Fitness',
            ],
            'Professional Services' => [
                'Legal Services',
                'Management Consulting',
                'Tax & Accounting Services',
                'Marketing Agency',
                'Architecture & Engineering',
            ],
            'Technology & Software' => [
                'SaaS',
                'Mobile App Development',
                'Artificial Intelligence',
                'Web Development',
                'Hardware & Electronics',
            ],
            'Food & Beverage' => [
                'Restaurants',
                'Cafes & Bakeries',
                'Catering',
                'Food Production',
                'Breweries & Wineries',
            ],
            'Real Estate & Construction' => [
                'Residential Real Estate',
                'Commercial Real Estate',
                'Property Management',
                'General Contracting',
                'Interior Design',
            ],
            'Education & Training' => [
                'Schools & Universities',
                'Online Learning',
                'Coaching & Tutoring',
                'Vocational Training',
            ],
            'Automotive' => [
                'Car Dealerships',
                'Repair Shop',
                'Auto Parts',
                'Rental Services',
                'Logistics & Transport',
            ],
            'Hospitality & Tourism' => [
                'Hotels & Resorts',
                'Travel Agency',
                'Tour Operator',
                'Event Planning',
                'Entertainment & Recreation',
            ],
            'Manufacturing & Industrial' => [
                'Machinery',
                'Textiles',
                'Chemicals',
                'Packaging',
                'Electronics Manufacturing',
            ],
        ];

        foreach ($departments as $deptName => $subs) {
            $parent = Category::updateOrCreate(
                ['slug' => Str::slug($deptName)],
                [
                    'name' => $deptName,
                    'type' => 'department',
                    'parent_id' => null,
                ]
            );

            foreach ($subs as $subName) {
                Category::updateOrCreate(
                    ['slug' => Str::slug($subName)],
                    [
                        'name' => $subName,
                        'type' => 'department',
                        'parent_id' => $parent->id,
                    ]
                );
            }
        }

        foreach ($businesses as $bizName => $subs) {
            $parent = Category::updateOrCreate(
                ['slug' => Str::slug($bizName)],
                [
                    'name' => $bizName,
                    'type' => 'business',
                    'parent_id' => null,
                ]
            );

            foreach ($subs as $subName) {
                Category::updateOrCreate(
                    ['slug' => Str::slug($subName)],
                    [
                        'name' => $subName,
                        'type' => 'business',
                        'parent_id' => $parent->id,
                    ]
                );
            }
        }
    }
}
