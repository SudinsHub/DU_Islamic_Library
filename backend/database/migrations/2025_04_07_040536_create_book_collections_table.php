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
        Schema::create('book_collections', function (Blueprint $table) {
            $table->uuid('collection_id')->primary();
            $table->uuid('book_id');
            $table->uuid('hall_id');
            $table->integer('available_copies');
            $table->integer('total_copies');
            $table->timestamps();
            $table->unique(['book_id', 'hall_id']);
            
            $table->foreign('book_id')->references('book_id')->on('books');
            $table->foreign('hall_id')->references('hall_id')->on('halls');
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('book_collections');
    }
};
