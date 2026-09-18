<?php
/**
 * EnvelopeSettersTrait - Fluent setters for EnvelopeBuilder.
 *
 * @package WpExam\Helpers\Traits
 */

namespace WpExam\Helpers\Traits;

if (!defined('ABSPATH')) {
    exit;
}

trait EnvelopeSettersTrait {
    public function withResults(array $results): self {
        $this->results = $results;

        return $this;
    }

    public function withMessage(string $message): self {
        $this->message = $message;

        return $this;
    }

    public function withCode(int $code): self {
        $this->code = $code;

        return $this;
    }

    public function withPagination(int $totalRecords, int $perPage, int $currentPage): self {
        $this->totalRecords = $totalRecords;
        $this->perPage = $perPage;
        $this->currentPage = $currentPage;

        $hasPerPage = ($perPage > 0);

        if ($hasPerPage) {
            $this->totalPages = (int) ceil($totalRecords / $perPage);
        } else {
            $this->totalPages = 1;
        }

        return $this;
    }

    public function withErrors(array $errors): self {
        $this->errors = $errors;
        $this->hasErrors = true;

        return $this;
    }
}
