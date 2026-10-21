<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration for recruitment pipeline applicant stages, applicants, and audit transitions.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('applicant_stages')) {
            Schema::create('applicant_stages', function (Blueprint $table) {
                $table->id();
                $table->string('stage_key')->unique();
                $table->string('title');
                $table->string('color')->default('#64748b');
                $table->integer('display_order')->default(0);
                $table->boolean('is_system_stage')->default(false);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('applicants')) {
            Schema::create('applicants', function (Blueprint $table) {
                $table->id();
                $table->string('candidate_name');
                $table->string('candidate_email');
                $table->string('phone')->nullable();
                $table->string('current_stage_key')->default('applied');
                $table->unsignedBigInteger('form_id')->default(0);
                $table->tinyInteger('rating')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->index('candidate_email');
                $table->index('current_stage_key');
            });
        }

        if (!Schema::hasTable('applicant_transitions')) {
            Schema::create('applicant_transitions', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('applicant_id');
                $table->string('from_stage_key')->nullable();
                $table->string('to_stage_key');
                $table->unsignedBigInteger('moved_by_user_id')->default(0);
                $table->text('notes')->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->foreign('applicant_id')->references('id')->on('applicants')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('applicant_transitions');
        Schema::dropIfExists('applicants');
        Schema::dropIfExists('applicant_stages');
    }
};
