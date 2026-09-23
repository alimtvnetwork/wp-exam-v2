<?php
/**
 * QueryResult - Structured database execution envelope with explicit boolean states.
 *
 * @package WpExam\Database
 */

declare(strict_types=1);

namespace WpExam\Database;

class QueryResult {
    public bool $is_success;
    public bool $is_fail;
    public mixed $data;
    public ?string $error_message;
    public string $sql;

    public function __construct(
        bool $isSuccess,
        mixed $data = null,
        ?string $errorMessage = null,
        string $sql = ''
    ) {
        $this->is_success = $isSuccess;
        $this->is_fail = !$isSuccess;
        $this->data = $data;
        $this->error_message = $errorMessage;
        $this->sql = $sql;
    }

    public static function success(mixed $data = null, string $sql = ''): self {
        return new self(
            true,
            $data,
            null,
            $sql
        );
    }

    public static function failure(string $errorMessage, string $sql = ''): self {
        return new self(
            false,
            null,
            $errorMessage,
            $sql
        );
    }
}
