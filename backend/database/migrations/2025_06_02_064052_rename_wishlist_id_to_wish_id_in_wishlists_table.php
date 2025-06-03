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
        Schema::table('wishlists', function (Blueprint $table) {
            // Rename the column from 'wishlist_id' to 'wish_id'
            $table->renameColumn('wishlist_id', 'wish_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('wishlists', function (Blueprint $table) {
            // Revert the column name from 'wish_id' back to 'wishlist_id'
            $table->renameColumn('wish_id', 'wishlist_id');
        });
    }
};