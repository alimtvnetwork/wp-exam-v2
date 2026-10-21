<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration for core Form schema, sections, fields, options, and submission values.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('forms')) {
            Schema::create('forms', function (Blueprint $table) {
                $table->id('FormId');
                $table->string('Slug')->unique();
                $table->string('Title');
                $table->string('ThemeId')->default('riseup-asia');
                $table->boolean('IsActive')->default(true);
                $table->boolean('HasDraftMode')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('form_sections')) {
            Schema::create('form_sections', function (Blueprint $table) {
                $table->id('FormSectionId');
                $table->unsignedBigInteger('FormId');
                $table->integer('StepOrder')->default(1);
                $table->string('Title');
                $table->text('Description')->nullable();
                $table->timestamps();

                $table->foreign('FormId')->references('FormId')->on('forms')->onDelete('cascade');
            });
        }

        if (!Schema::hasTable('form_fields')) {
            Schema::create('form_fields', function (Blueprint $table) {
                $table->id('FormFieldId');
                $table->unsignedBigInteger('FormSectionId');
                $table->string('FieldKey');
                $table->string('FieldType')->default('text');
                $table->string('Label');
                $table->boolean('IsRequired')->default(false);
                $table->boolean('HasRealtimeValidation')->default(false);
                $table->text('ValidationRules')->nullable();
                $table->integer('DisplayOrder')->default(0);
                $table->timestamps();

                $table->foreign('FormSectionId')->references('FormSectionId')->on('form_sections')->onDelete('cascade');
            });
        }

        if (!Schema::hasTable('form_options')) {
            Schema::create('form_options', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('form_field_id');
                $table->string('option_label');
                $table->string('option_value');
                $table->integer('display_order')->default(0);
                $table->boolean('is_default')->default(false);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('form_submissions')) {
            Schema::create('form_submissions', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('form_id');
                $table->string('submitter_email')->nullable();
                $table->string('status')->default('submitted');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('form_submission_values')) {
            Schema::create('form_submission_values', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('submission_id');
                $table->unsignedBigInteger('field_id');
                $table->text('field_value')->nullable();
                $table->timestamps();

                $table->foreign('submission_id')->references('id')->on('form_submissions')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('form_submission_values');
        Schema::dropIfExists('form_submissions');
        Schema::dropIfExists('form_options');
        Schema::dropIfExists('form_fields');
        Schema::dropIfExists('form_sections');
        Schema::dropIfExists('forms');
    }
};
