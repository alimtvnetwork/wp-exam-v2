<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Migration for users table (Admin and Candidate accounts).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email')->unique();
                $table->string('username')->unique()->nullable();
                $table->string('password_hash');
                $table->string('role')->default('candidate'); // 'admin' or 'candidate'
                $table->string('phone')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->index('role');
                $table->index('email');
            });

            // Seed default admin: admin / Admin@1234
            DB::table('users')->insert([
                'id' => 1,
                'name' => 'System Administrator',
                'email' => 'admin@example.com',
                'username' => 'admin',
                'password_hash' => password_hash('Admin@1234', PASSWORD_BCRYPT),
                'role' => 'admin',
                'phone' => '',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
