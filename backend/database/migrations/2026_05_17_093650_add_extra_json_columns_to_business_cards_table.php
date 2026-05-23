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
            $table->json('custom_links')->nullable()->after('company_details');
            $table->json('documents')->nullable()->after('gallery');
            $table->json('location_info')->nullable()->after('documents');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('business_cards', function (Blueprint $table) {
            $table->dropColumn('custom_links');
            $table->dropColumn('documents');
            $table->dropColumn('location_info');
        });
    }
};
