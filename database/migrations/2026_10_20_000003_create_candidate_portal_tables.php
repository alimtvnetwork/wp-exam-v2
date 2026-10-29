<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration for candidate portal step completions and verification milestones.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('portal_step_completions')) {
            Schema::create('portal_step_completions', function (Blueprint $table) {
                $table->id();
                $table->string('candidate_token');
                $table->string('step_id');
                $table->string('completed_by')->nullable();
                $table->text('notes')->nullable();
                $table->timestamp('completed_at')->useCurrent();

                $table->index('candidate_token');
                $table->index('step_id');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('portal_step_completions');
    }
};
