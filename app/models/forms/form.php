<?php

declare(strict_types=1);

namespace App\Models\Forms;

use App\Models\Model;

/**
 * Eloquent Form Model.
 */
class Form extends Model
{
    protected string $primaryKey = 'FormId';

    /** @var array<int, FormSection> */
    protected array $sections = [];

    public function getFormId(): int
    {
        return (int) ($this->getAttribute('FormId') ?? 0);
    }

    public function getSlug(): string
    {
        return (string) ($this->getAttribute('Slug') ?? '');
    }

    public function getTitle(): string
    {
        return (string) ($this->getAttribute('Title') ?? '');
    }

    public function getThemeId(): string
    {
        return (string) ($this->getAttribute('ThemeId') ?? 'riseup-asia');
    }

    public function isActive(): bool
    {
        $flag = (int) ($this->getAttribute('IsActive') ?? 1);

        return $flag === 1;
    }

    public function hasDraftMode(): bool
    {
        $flag = (int) ($this->getAttribute('HasDraftMode') ?? 1);

        return $flag === 1;
    }

    public function hasCaptcha(): bool
    {
        $flag = (int) ($this->getAttribute('HasCaptcha') ?? 1);

        return $flag === 1;
    }

    public function addSection(FormSection $section): self
    {
        $this->sections[] = $section;

        return $this;
    }

    /**
     * @return array<int, FormSection>
     */
    public function getSections(): array
    {
        return $this->sections;
    }
}
