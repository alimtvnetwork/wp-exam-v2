<?php

declare(strict_types=1);

namespace App\Models\Users;

use App\Models\Model;

/**
 * Eloquent-compatible User Model for Admin and Candidate accounts.
 */
class User extends Model
{
    protected string $primaryKey = 'id';

    public function getId(): int
    {
        return (int) ($this->getAttribute('id') ?? 0);
    }

    public function getName(): string
    {
        return (string) ($this->getAttribute('name') ?? '');
    }

    public function getEmail(): string
    {
        return (string) ($this->getAttribute('email') ?? '');
    }

    public function getUsername(): string
    {
        return (string) ($this->getAttribute('username') ?? '');
    }

    public function getPasswordHash(): string
    {
        return (string) ($this->getAttribute('password_hash') ?? '');
    }

    public function getRole(): string
    {
        return (string) ($this->getAttribute('role') ?? 'candidate');
    }

    public function getPhone(): string
    {
        return (string) ($this->getAttribute('phone') ?? '');
    }

    public function isAdmin(): bool
    {
        return $this->getRole() === 'admin';
    }

    public function isCandidate(): bool
    {
        return $this->getRole() === 'candidate';
    }

    public function isActive(): bool
    {
        $val = (int) ($this->getAttribute('is_active') ?? 1);

        return $val === 1;
    }

    public function verifyPassword(string $password): bool
    {
        $hash = $this->getPasswordHash();
        $hasHash = (strlen($hash) > 0);

        if ($hasHash) {
            return password_verify($password, $hash);
        }

        return false;
    }

    public function toSafeArray(): array
    {
        return [
            'id' => $this->getId(),
            'name' => $this->getName(),
            'email' => $this->getEmail(),
            'username' => $this->getUsername(),
            'role' => $this->getRole(),
            'phone' => $this->getPhone(),
            'is_active' => $this->isActive(),
            'created_at' => (string) ($this->getAttribute('created_at') ?? ''),
        ];
    }
}
