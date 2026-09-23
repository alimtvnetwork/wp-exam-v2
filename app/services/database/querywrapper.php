<?php

declare(strict_types=1);

namespace App\Services\Database;

use PDO;
use Throwable;

/**
 * Standardized Database Query Result Container with Explicit Boolean States.
 */
class QueryResult
{
    public bool $is_success;
    public bool $is_fail;
    public bool $isSuccess;
    public bool $isFail;
    public mixed $data;
    public ?string $errorMessage;
    public string $contextSql;

    public function __construct(
        bool $isSuccess,
        mixed $data = null,
        ?string $errorMessage = null,
        string $contextSql = ''
    ) {
        $this->is_success = $isSuccess;
        $this->is_fail = !$isSuccess;
        $this->isSuccess = $isSuccess;
        $this->isFail = !$isSuccess;
        $this->data = $data;
        $this->errorMessage = $errorMessage;
        $this->contextSql = $contextSql;
    }

    public static function success(mixed $data = null, string $contextSql = ''): self
    {
        return new self(true, $data, null, $contextSql);
    }

    public static function failure(string $errorMessage, string $contextSql = ''): self
    {
        return new self(false, null, $errorMessage, $contextSql);
    }

    public function isSuccess(): bool
    {
        return $this->isSuccess;
    }

    public function isFail(): bool
    {
        return $this->isFail;
    }
}

/**
 * Standardized PDO Query Wrapper with Automated Error Logging.
 */
class QueryWrapper
{
    /**
     * Executes an arbitrary PDO database operation safely with structured error logging.
     *
     * @param PDO $pdo
     * @param callable(PDO): mixed $callback
     * @param string $contextSql
     * @return QueryResult
     */
    public static function execute(PDO $pdo, callable $callback, string $contextSql = ''): QueryResult
    {
        try {
            $data = $callback($pdo);

            return QueryResult::success($data, $contextSql);
        } catch (Throwable $e) {
            $errorMsg = $e->getMessage();
            $logContext = sprintf(
                "[QueryWrapper Error] SQL: %s | Error: %s | Trace: %s",
                $contextSql,
                $errorMsg,
                $e->getFile() . ':' . $e->getLine()
            );

            error_log($logContext);

            return QueryResult::failure($errorMsg, $contextSql);
        }
    }
}
