<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('requests', function (Blueprint $table) {
            $table->uuid('req_id')->primary();
            $table->foreignUuid('reader_id')->references('reader_id')->on('readers')->constrained()->cascadeOnDelete();
            $table->foreignUuid('book_id')->references('book_id')->on('books')->constrained()->cascadeOnDelete();
            $table->foreignUuid('hall_id')->references('hall_id')->on('halls')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->date('request_date')->default(now());
            $table->enum('status', ['pending', 'fulfilled', 'cancelled'])->default('pending');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('requests');
    }
};
