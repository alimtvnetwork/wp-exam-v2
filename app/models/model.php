<?php

declare(strict_types=1);

namespace App\Models;

use JsonSerializable;

/**
 * Lightweight Eloquent-compatible Base Model for WP Exam standalone engine.
 */
abstract class Model implements JsonSerializable
{
    /** @var array<string, mixed> */
    protected array $attributes = [];

    protected string $primaryKey = 'id';

    public function __construct(array $attributes = [])
    {
        $this->fill($attributes);
    }

    public function fill(array $attributes): self
    {
        foreach ($attributes as $key => $value) {
            $this->setAttribute($key, $value);
        }

        return $this;
    }

    public function setAttribute(string $key, mixed $value): void
    {
        $this->attributes[$key] = $value;
    }

    public function getAttribute(string $key): mixed
    {
        $hasKey = array_key_exists($key, $this->attributes);

        if ($hasKey) {
            return $this->attributes[$key];
        }

        return null;
    }

    public function __get(string $name): mixed
    {
        return $this->getAttribute($name);
    }

    public function __set(string $name, mixed $value): void
    {
        $this->setAttribute($name, $value);
    }

    public function toArray(): array
    {
        return $this->attributes;
    }

    public function jsonSerialize(): mixed
    {
        return $this->toArray();
    }
}
