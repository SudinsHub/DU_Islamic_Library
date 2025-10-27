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
        Schema::create('volunteer_reviews', function (Blueprint $table) {
            $table->uuid('volRev_id')->primary();
            $table->foreignUuid('reader_id')->references('reader_id')->on('readers')->constrained()->cascadeOnDelete();
            $table->foreignUuid('volunteer_id')->references('volunteer_id')->on('volunteers')->constrained()->cascadeOnDelete();
            $table->text('comment');
            $table->float('rating');
            $table->date('review_date')->default(now());
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('volunteer_reviews');
    }
};
