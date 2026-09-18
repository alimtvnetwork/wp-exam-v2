<?php
/**
 * DbExecResult - Database mutation result wrapper.
 *
 * @package WpExam\Database
 */

namespace WpExam\Database;

if (!defined('ABSPATH')) {
    exit;
}

use Throwable;

final class DbExecResult {
    private function __construct(
        private readonly int $rowsAffected = 0,
        private readonly int $insertId = 0,
        private readonly ?Throwable $error = null,
    ) {
    }

    public static function of(int $rowsAffected, int $insertId = 0): self {
        return new self(
            rowsAffected: $rowsAffected,
            insertId: $insertId,
        );
    }

    public static function error(Throwable $error): self {
        return new self(
            rowsAffected: 0,
            insertId: 0,
            error: $error,
        );
    }

    public function isSuccess(): bool {
        $isSuccess = ($this->error === null);

        return $isSuccess;
    }

    public function hasError(): bool {
        $hasError = ($this->error !== null);

        return $hasError;
    }

    public function getRowsAffected(): int {
        return $this->rowsAffected;
    }

    public function getInsertId(): int {
        return $this->insertId;
    }

    public function getError(): ?Throwable {
        return $this->error;
    }
}
