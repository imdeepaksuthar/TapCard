<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('business_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('slug')->unique(); // High-speed indexing implicitly created
            $table->string('template_id')->default('default');
            $table->enum('status', ['active', 'inactive'])->default('active');
            
            // Media Assets
            $table->string('profile_image')->nullable();
            $table->string('company_logo')->nullable();
            $table->string('brochure_path')->nullable();
            
            // JSON Configuration Blocks
            $table->json('personal_info')->nullable(); // name, designation, company, bio
            $table->json('contact_buttons')->nullable(); // call, whatsapp, email, sms
            $table->json('social_links')->nullable(); // fb, ig, linkedin, yt, x, telegram
            $table->json('company_details')->nullable(); // address, gst, working_hours, services
            $table->json('payment_info')->nullable(); // upi, gpay, phonepe, paytm, bank_details, qr_path
            $table->json('gallery')->nullable(); // images, videos
            $table->json('custom_branding')->nullable(); // colors, font, dark_mode_enabled
            $table->json('seo_metadata')->nullable(); // title, description, keywords
            
            // Analytics
            $table->unsignedBigInteger('views_count')->default(0);
            
            $table->timestamps();
            
            // Explicit Index for API routing lookups
            $table->index('slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('business_cards');
    }
};
