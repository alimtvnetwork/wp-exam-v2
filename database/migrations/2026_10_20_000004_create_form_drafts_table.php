<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration for cross-device draft resume sessions and tokens.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('form_drafts')) {
            Schema::create('form_drafts', function (Blueprint $table) {
                $table->id();
                $table->string('token')->unique();
                $table->unsignedBigInteger('form_id');
                $table->string('email')->nullable();
                $table->integer('step_index')->default(0);
                $table->longText('state_data');
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->useCurrent();

                $table->index('token');
                $table->index('email');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('form_drafts');
    }
};
