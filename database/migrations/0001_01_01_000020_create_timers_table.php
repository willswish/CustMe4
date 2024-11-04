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
        Schema::create('timers', function (Blueprint $table) {
            $table->id('timer_id');
            $table->unsignedBigInteger('request_id');
            $table->foreign('request_id')->references('request_id')->on('requests')->onDelete('cascade');

            $table->timestamp('start_time'); // The time when the countdown starts
            $table->timestamp('deadline')->nullable(); // The final deadline for the countdown
            $table->integer('duration_days')->nullable(); // Original number of days for countdown
            $table->integer('duration_minutes')->nullable(); // Original number of minutes for countdown

            $table->timestamps(); // Includes created_at and updated_at
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('timers');
    }
};
