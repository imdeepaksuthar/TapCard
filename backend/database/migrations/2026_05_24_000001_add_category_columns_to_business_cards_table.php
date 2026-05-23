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
            $table->foreignId('category_id')
                ->nullable()
                ->after('status')
                ->constrained('categories')
                ->nullOnDelete();
            $table->foreignId('subcategory_id')
                ->nullable()
                ->after('category_id')
                ->constrained('categories')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('business_cards', function (Blueprint $table) {
            $table->dropForeign(['business_cards_category_id_foreign']);
            $table->dropForeign(['business_cards_subcategory_id_foreign']);
            $table->dropColumn(['category_id', 'subcategory_id']);
        });
    }
};
