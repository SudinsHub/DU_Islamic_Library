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
        Schema::create('admins', function (Blueprint $table) {
            $table->uuid('admin_id')->primary(); // UUID Primary Key
            $table->string('name')->nullable(false); // Required Name
            $table->string('email')->unique()->nullable(false); // Required & Unique Email
            $table->string('contact')->nullable();
            $table->string('password')->nullable(false); // Required Password
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admins');
    }
};
