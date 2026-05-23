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
        Schema::table('business_cards', function (Blueprint $table) {
            $table->json('proprietor_details')->nullable();
            $table->json('gallery_content')->nullable();
            $table->json('opening_hours')->nullable();
            $table->json('brochure_pdfs')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('business_cards', function (Blueprint $table) {
            $table->dropColumn([
                'proprietor_details',
                'gallery_content',
                'opening_hours',
                'brochure_pdfs'
            ]);
        });
    }
};
