<?php
/**
 * TypedQuery - Generic typed query helper wrapping wpdb.
 *
 * Provides queryOne(), queryMany(), and exec() that return
 * DbResult<T>, DbResultSet<T>, and DbExecResult respectively.
 *
 * @package WpExam\Database
 */

namespace WpExam\Database;

if (!defined('ABSPATH')) {
    exit;
}

use wpdb;
use Closure;
use Throwable;

final class TypedQuery {
    public function __construct(
        private readonly wpdb $wpdb,
    ) {
    }

    /**
     * @template T
     * @param string $sql
     * @param array<mixed> $params
     * @param Closure(array<string,mixed>): T $mapper
     * @return DbResult<T>
     */
    public function queryOne(
        string $sql,
        array $params,
        Closure $mapper,
    ): DbResult {
        $preparedSql = $this->prepare($sql, $params);

        $row = WpDbQueryWrapper::execute($this->wpdb, function(wpdb $db) use ($preparedSql) {
            return $db->get_row($preparedSql, ARRAY_A);
        }, $preparedSql);

        $isEmpty = ($row === null || $row === false);

        if ($isEmpty) {
            return DbResult::empty();
        }

        try {
            $mapped = $mapper($row);

            return DbResult::of($mapped);
        } catch (Throwable $e) {
            return DbResult::error($e);
        }
    }

    /**
     * @template T
     * @param string $sql
     * @param array<mixed> $params
     * @param Closure(array<string,mixed>): T $mapper
     * @return DbResultSet<T>
     */
    public function queryMany(
        string $sql,
        array $params,
        Closure $mapper,
    ): DbResultSet {
        $preparedSql = $this->prepare($sql, $params);

        $rows = WpDbQueryWrapper::execute($this->wpdb, function(wpdb $db) use ($preparedSql) {
            return $db->get_results($preparedSql, ARRAY_A);
        }, $preparedSql);

        $isInvalid = ($rows === null || $rows === false);

        if ($isInvalid) {
            return DbResultSet::empty();
        }

        $results = [];

        try {
            foreach ($rows as $row) {
                $results[] = $mapper($row);
            }

            return DbResultSet::of($results);
        } catch (Throwable $e) {
            return DbResultSet::error($e);
        }
    }

    /**
     * Executes an INSERT, UPDATE, or DELETE query.
     */
    public function exec(string $sql, array $params = []): DbExecResult {
        $preparedSql = $this->prepare($sql, $params);

        $result = WpDbQueryWrapper::execute($this->wpdb, function(wpdb $db) use ($preparedSql) {
            return $db->query($preparedSql);
        }, $preparedSql);

        $isFail = ($result === false);

        if ($isFail) {
            return DbExecResult::error(new \RuntimeException($this->wpdb->last_error ?: 'Query failed'));
        }

        $insertId = (int) $this->wpdb->insert_id;
        $rowsAffected = (int) $result;

        return DbExecResult::of($rowsAffected, $insertId);
    }

    private function prepare(string $sql, array $params): string {
        $hasParams = (count($params) > 0);

        if ($hasParams) {
            return $this->wpdb->prepare($sql, ...$params);
        }

        return $sql;
    }
}
