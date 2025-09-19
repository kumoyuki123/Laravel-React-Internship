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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->string('roll_no')->index();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('nrc_no')->unique();
            $table->string('phone')->nullable();
            $table->string('major')->nullable();
            $table->string('year')->nullable();
            $table->unsignedTinyInteger('iq_score')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
