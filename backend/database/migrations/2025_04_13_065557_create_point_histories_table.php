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
        Schema::create('point_histories', function (Blueprint $table) {
            $table->uuid('point_id')->primary();
            $table->foreignUuid('reader_id')->references('reader_id')->on('readers')->constrained()->cascadeOnDelete();
            $table->foreignUuid('book_id')->nullable()->references('book_id')->on('books')->constrained()->cascadeOnDelete();
            $table->foreignUuid('activity_type')->references('activity_type')->on('point_systems')->constrained()->cascadeOnDelete();
            $table->date('earned_date')->default(now());
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('point_histories');
    }
};
