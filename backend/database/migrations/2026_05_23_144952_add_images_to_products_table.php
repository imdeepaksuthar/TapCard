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
        Schema::table('products', function (Blueprint $table) {
            $table->json('images')->nullable()->after('price');
        });

        // Migrate existing single images into the new images array
        $products = \App\Models\Product::all();
        foreach ($products as $product) {
            if (!empty($product->image)) {
                $product->images = [$product->image];
                $product->save();
            }
        }

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('image');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('image')->nullable()->after('price');
        });

        // Try to revert data
        $products = \App\Models\Product::all();
        foreach ($products as $product) {
            if (!empty($product->images) && count($product->images) > 0) {
                // Just keep the first one
                $product->image = $product->images[0];
                $product->save();
            }
        }

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('images');
        });
    }
};
