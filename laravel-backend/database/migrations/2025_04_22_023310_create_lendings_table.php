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
        Schema::create('lendings', function (Blueprint $table) {
            $table->uuid('lending_id')->primary();
            $table->foreignUuid('volunteer_id')->references('volunteer_id')->on('volunteers')->constrained()->cascadeOnDelete()->nullable();
            $table->foreignUuid('req_id')->references('req_id')->on('requests')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->date('issue_date')->default(now());
            $table->date('return_date')->nullable();
            $table->enum('status', ['pending', 'returned', 'lost'])->default('pending');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lendings');
    }
};
