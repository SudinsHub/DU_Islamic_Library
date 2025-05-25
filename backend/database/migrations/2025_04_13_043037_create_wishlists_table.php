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
        Schema::create('wishlists', function (Blueprint $table) {
            $table->uuid('wishlist_id')->primary();
            $table->foreignUuid('reader_id')->references('reader_id')->on('readers')->constrained()->cascadeOnDelete();
            $table->foreignUuid('book_id')->references('book_id')->on('books')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->date('added_on')->default(now());
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wishlists');
    }
};
