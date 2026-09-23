<?php

declare(strict_types=1);

namespace App\Models\Forms;

use App\Models\Model;

/**
 * FieldCondition Model governing reactive dynamic branching logic.
 */
class FieldCondition extends Model
{
    protected string $primaryKey = 'FieldConditionId';

    public function getParentFieldKey(): string
    {
        return (string) ($this->getAttribute('ParentFieldKey') ?? '');
    }

    public function getOperator(): string
    {
        return (string) ($this->getAttribute('Operator') ?? 'equals');
    }

    public function getExpectedValue(): mixed
    {
        return $this->getAttribute('ExpectedValue');
    }

    public function getTargetType(): string
    {
        return (string) ($this->getAttribute('TargetType') ?? 'field');
    }

    public function getTargetKey(): string
    {
        return (string) ($this->getAttribute('TargetKey') ?? '');
    }

    public function getAction(): string
    {
        return (string) ($this->getAttribute('Action') ?? 'show');
    }

    public function isActive(): bool
    {
        $flag = (int) ($this->getAttribute('IsActive') ?? 1);

        return $flag === 1;
    }

    /**
     * Evaluates condition against submitted payload context.
     *
     * @param array<string, mixed> $payload
     */
    public function evaluate(array $payload): bool
    {
        $isInactive = !$this->isActive();

        if ($isInactive) {
            return false;
        }

        $parentKey = $this->getParentFieldKey();
        $hasParent = array_key_exists($parentKey, $payload);

        if (!$hasParent) {
            return false;
        }

        $actual = $payload[$parentKey];
        $expected = $this->getExpectedValue();
        $operator = $this->getOperator();

        if ($operator === 'equals') {
            return (string) $actual === (string) $expected;
        }

        if ($operator === 'not_equals') {
            return (string) $actual !== (string) $expected;
        }

        if ($operator === 'greater_than') {
            return (float) $actual > (float) $expected;
        }

        if ($operator === 'in') {
            $expectedList = is_array($expected) ? $expected : explode(',', (string) $expected);

            return in_array((string) $actual, array_map('strval', $expectedList), true);
        }

        return false;
    }
}
