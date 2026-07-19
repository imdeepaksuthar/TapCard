<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\BusinessCard;
use App\Models\Service;
use App\Models\Product;
use Illuminate\Database\Seeder;

class DemoUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Personal User
        $user1 = User::updateOrCreate(
            ['email' => 'personal@example.com'],
            [
                'name' => 'John Personal',
                'password' => bcrypt('password'),
                'role' => 'user',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        BusinessCard::updateOrCreate(
            ['user_id' => $user1->id],
            [
                'slug' => 'john-personal',
                'template_id' => 'personal',
                'status' => 'active',
                'personal_info' => [
                    'name' => 'John Doe',
                    'designation' => 'Digital Enthusiast',
                    'company_name' => '',
                    'bio' => 'I love sharing my personal links and connecting with friends online.',
                ],
                'contact_buttons' => [
                    'call' => '+1234567890',
                    'whatsapp' => '+1234567890',
                    'email' => 'john@example.com',
                    'sms' => '+1234567890',
                ],
                'social_links' => [
                    'facebook' => 'https://facebook.com/johndoe',
                    'instagram' => 'https://instagram.com/johndoe',
                    'linkedin' => 'https://linkedin.com/in/johndoe',
                    'twitter' => 'https://twitter.com/johndoe',
                ],
                'custom_branding' => [
                    'primary_color' => '#8b5cf6',
                    'secondary_color' => '#f3e8ff',
                    'font_family' => 'Inter',
                    'dark_mode_enabled' => false,
                ],
            ]
        );

        // 2. Professional User
        $user2 = User::updateOrCreate(
            ['email' => 'professional@example.com'],
            [
                'name' => 'Sarah Professional',
                'password' => bcrypt('password'),
                'role' => 'user',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        BusinessCard::updateOrCreate(
            ['user_id' => $user2->id],
            [
                'slug' => 'sarah-professional',
                'template_id' => 'professional',
                'status' => 'active',
                'personal_info' => [
                    'name' => 'Sarah Jenkins',
                    'designation' => 'Freelance Designer',
                    'company_name' => 'Sarah Designs',
                    'bio' => 'Freelance graphic designer specializing in branding and UI/UX design.',
                ],
                'contact_buttons' => [
                    'call' => '+0987654321',
                    'whatsapp' => '+0987654321',
                    'email' => 'sarah@example.com',
                ],
                'social_links' => [
                    'linkedin' => 'https://linkedin.com/in/sarahj',
                    'dribbble' => 'https://dribbble.com/sarahj',
                    'behance' => 'https://behance.net/sarahj',
                ],
                'company_details' => [
                    'address' => '123 Freelance St, Design City, DC 10001',
                    'working_hours' => [
                        'monday' => '09:00 AM - 05:00 PM',
                        'tuesday' => '09:00 AM - 05:00 PM',
                        'wednesday' => '09:00 AM - 05:00 PM',
                        'thursday' => '09:00 AM - 05:00 PM',
                        'friday' => '09:00 AM - 05:00 PM',
                    ],
                ],
                'appointment_details' => [
                    'is_enabled' => true,
                    'title' => 'Book a Consultation',
                    'duration' => '30',
                    'available_days' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                    'time_slots' => ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
                ],
                'payment_info' => [
                    'upi' => 'sarah@upi',
                    'bank_details' => [
                        'account_name' => 'Sarah Jenkins',
                        'account_number' => '123456789012',
                        'ifsc_code' => 'BANK0009876',
                        'bank_name' => 'Global Bank',
                    ],
                ],
                'custom_links' => [
                    ['title' => 'My Portfolio', 'url' => 'https://example.com/portfolio'],
                    ['title' => 'Read my Blog', 'url' => 'https://example.com/blog'],
                ],
                'gallery' => [
                    [
                        'url' => 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500',
                        'type' => 'image',
                        'caption' => 'Brand Identity Project'
                    ],
                    [
                        'url' => 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500',
                        'type' => 'image',
                        'caption' => 'UI Mockup'
                    ]
                ],
                'custom_branding' => [
                    'primary_color' => '#0ea5e9',
                    'secondary_color' => '#e0f2fe',
                    'font_family' => 'Roboto',
                    'dark_mode_enabled' => true,
                ],
            ]
        );

        
        // Create 25 Services for Professional User
        $services = [
            'Web Design', 'UI/UX Design', 'Logo Design', 'Branding', 'SEO Optimization',
            'Social Media Marketing', 'Copywriting', 'Content Strategy', 'Video Editing', 'Motion Graphics',
            'Illustration', 'Photography', 'App Development', 'E-commerce Setup', 'Email Marketing',
            'Virtual Assistance', 'Data Entry', 'Market Research', 'Translation Services', 'Voiceover',
            'Consulting', 'Business Coaching', 'Resume Writing', 'Career Counseling', 'Financial Planning'
        ];

        foreach ($services as $index => $serviceName) {
            Service::updateOrCreate(
                ['slug' => \Illuminate\Support\Str::slug($serviceName . '-pro')],
                [
                    'name' => $serviceName,
                    'user_id' => $user2->id,
                    'description' => 'Professional ' . strtolower($serviceName) . ' services tailored for your business needs.',
                    'price' => rand(50, 500),
                    'is_active' => true,
                ]
            );
        }

        // 3. Business User
        $user3 = User::updateOrCreate(
            ['email' => 'business@example.com'],
            [
                'name' => 'Acme Business',
                'password' => bcrypt('password'),
                'role' => 'user',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        BusinessCard::updateOrCreate(
            ['user_id' => $user3->id],
            [
                'slug' => 'acme-business',
                'template_id' => 'business',
                'status' => 'active',
                'personal_info' => [
                    'name' => 'Michael Scott',
                    'designation' => 'Regional Manager',
                    'company_name' => 'Acme Paper Co.',
                    'bio' => 'Leading supplier of quality paper and office products in the region. We provide premium stationery, paper goods, and office essentials to businesses across the tri-state area.',
                ],
                'contact_buttons' => [
                    'call' => '+1122334455',
                    'whatsapp' => '+1122334455',
                    'email' => 'contact@acmepaper.com',
                    'sms' => '+1122334455',
                ],
                'social_links' => [
                    'linkedin' => 'https://linkedin.com/company/acmepaper',
                    'twitter' => 'https://twitter.com/acmepaper',
                    'facebook' => 'https://facebook.com/acmepaper',
                    'instagram' => 'https://instagram.com/acmepaper',
                    'youtube' => 'https://youtube.com/@acmepaper',
                ],
                'custom_links' => [
                    ['title' => 'Our Product Catalog', 'url' => 'https://acmepaper.example.com/catalog'],
                    ['title' => 'Bulk Order Enquiry', 'url' => 'https://acmepaper.example.com/bulk-orders'],
                    ['title' => 'Franchise Opportunities', 'url' => 'https://acmepaper.example.com/franchise'],
                ],
                'company_details' => [
                    'address' => '456 Business Blvd, Corporate Town, NY 20002',
                    'gst' => 'GSTIN123456789',
                    'website' => 'https://acmepaper.example.com',
                    'working_hours' => [
                        'monday' => '08:00 AM - 06:00 PM',
                        'tuesday' => '08:00 AM - 06:00 PM',
                        'wednesday' => '08:00 AM - 06:00 PM',
                        'thursday' => '08:00 AM - 06:00 PM',
                        'friday' => '08:00 AM - 06:00 PM',
                        'saturday' => '10:00 AM - 02:00 PM',
                    ],
                ],
                'payment_info' => [
                    'upi' => 'acme@upi',
                    'bank_details' => [
                        'account_name' => 'Acme Paper Co',
                        'account_number' => '9876543210',
                        'ifsc_code' => 'BANK0001234',
                        'bank_name' => 'National Bank',
                    ],
                ],
                'appointment_details' => [
                    'is_enabled' => true,
                    'title' => 'Schedule a Meeting',
                    'duration' => '45',
                    'available_days' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                    'time_slots' => ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'],
                ],
                'gallery' => [
                    [
                        'url' => 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500',
                        'type' => 'image',
                        'caption' => 'Our Modern Office',
                    ],
                    [
                        'url' => 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=500',
                        'type' => 'image',
                        'caption' => 'Team Collaboration',
                    ],
                    [
                        'url' => 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=500',
                        'type' => 'image',
                        'caption' => 'Product Showcase',
                    ],
                ],
                'location_info' => [
                    'latitude' => '40.7128',
                    'longitude' => '-74.0060',
                    'address' => '456 Business Blvd, Corporate Town, NY 20002',
                    'map_enabled' => true,
                ],
                'seo_metadata' => [
                    'meta_title' => 'Acme Paper Co. - Premium Office Supplies',
                    'meta_description' => 'Your one-stop shop for premium paper products and office supplies. Quality stationery, printing paper, and business essentials delivered across the tri-state area.',
                ],
                'custom_branding' => [
                    'primary_color' => '#f59e0b',
                    'secondary_color' => '#fef3c7',
                    'font_family' => 'Inter',
                    'dark_mode_enabled' => false,
                ],
            ]
        );

        // Create 25 Products for Business User
        $products = [
            'Premium Notebook', 'Executive Pen', 'Desk Organizer', 'Leather Briefcase', 'Wireless Mouse',
            'Mechanical Keyboard', 'Monitor Stand', 'Ergonomic Chair', 'Noise Cancelling Headphones', 'Coffee Mug',
            'Water Bottle', 'Planner 2026', 'Sticky Notes Pack', 'Highlighter Set', 'Fountain Pen',
            'USB-C Hub', 'Portable Charger', 'Webcam', 'Microphone', 'Ring Light',
            'Whiteboard', 'Dry Erase Markers', 'Paper Shredder', 'Laser Printer', 'Presentation Clicker'
        ];

        foreach ($products as $index => $productName) {
            Product::updateOrCreate(
                ['slug' => \Illuminate\Support\Str::slug($productName . '-bus')],
                [
                    'name' => $productName,
                    'user_id' => $user3->id,
                    'description' => 'High quality ' . strtolower($productName) . ' perfect for your office.',
                    'price' => rand(10, 300),
                    'is_active' => true,
                ]
            );
        }
    }
}

