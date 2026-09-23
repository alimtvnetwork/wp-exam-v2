<?php
/**
 * SqlQueryWrapper - Executes PDO database operations safely with automated error logging and explicit boolean states.
 *
 * @package WpExam\Database
 */

declare(strict_types=1);

namespace WpExam\Database;

use PDO;
use Throwable;
use WpExam\Logging\FileLogger;
use WpExam\Enums\ResponseMessageType;

class SqlQueryWrapper {
    /**
     * Executes a PDO callable safely, logs any caught exception, and returns a structured QueryResult.
     *
     * @template T
     * @param PDO $pdo
     * @param callable(PDO): T $callback
     * @param string $contextSql
     * @return QueryResult
     */
    public static function execute(PDO $pdo, callable $callback, string $contextSql = ''): QueryResult {
        try {
            $data = $callback($pdo);

            return QueryResult::success($data, $contextSql);
        } catch (Throwable $e) {
            $errorMsg = $e->getMessage();

            if (class_exists(FileLogger::class)) {
                FileLogger::getInstance()->error(
                    defined(ResponseMessageType::class . '::DbQueryFailed') 
                        ? ResponseMessageType::DbQueryFailed->value 
                        : 'Database query failed',
                    [
                        'sql'   => $contextSql,
                        'error' => $errorMsg,
                        'trace' => $e->getTraceAsString(),
                    ]
                );
            }

            return QueryResult::failure($errorMsg, $contextSql);
        }
    }
}
