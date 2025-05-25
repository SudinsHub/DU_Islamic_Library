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
        Schema::create('readers', function (Blueprint $table) {
            $table->uuid('reader_id')->primary(); // UUID Primary Key
            $table->string('name')->nullable(false); // Required Name
            $table->string('registration_no')->nullable();
            $table->string('session')->nullable();
            $table->string('email')->unique()->nullable(false); 
            $table->string('contact')->nullable();
            $table->uuid('hall_id'); // Foreign Key for Hall
            $table->uuid('dept_id'); // Foreign Key for Department
            $table->string('password')->nullable(false); // Required Password
            $table->boolean('isVerified')->default(false); // Default false
            $table->integer('total_points')->default(0); // Default 0
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->timestamps();
            
            // Foreign Key Constraints
            $table->foreign('hall_id')->references('hall_id')->on('halls')->onDelete('set null');
            $table->foreign('dept_id')->references('dept_id')->on('departments')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('readers');
    }
};
