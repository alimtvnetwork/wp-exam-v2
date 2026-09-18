<?php
/**
 * Lightweight fluent micro-ORM for SQLite queries.
 * Based on riseup-asia-uploader Orm pattern.
 *
 * @package WpExam\Database
 */

declare(strict_types=1);

namespace WpExam\Database;

if (!defined('ABSPATH')) {
    exit;
}

use PDO;
use Throwable;
use WpExam\Logging\FileLogger;

class Orm {
    private string $tableName;
    private array $whereClauses = [];
    private array $whereParams = [];
    private ?string $orderByClause = null;
    private ?int $limitCount = null;

    public static function forTable(string $tableName): self {
        return new self($tableName);
    }

    private function __construct(string $tableName) {
        $this->tableName = $tableName;
    }

    public function where(string $column, mixed $value): self {
        $this->whereClauses[] = "{$column} = ?";
        $this->whereParams[] = $value;
        return $this;
    }

    public function orderBy(string $column, string $direction = 'ASC'): self {
        $dir = strtoupper($direction) === 'DESC' ? 'DESC' : 'ASC';
        $this->orderByClause = "ORDER BY {$column} {$dir}";
        return $this;
    }

    public function limit(int $count): self {
        $this->limitCount = $count;
        return $this;
    }

    private function getPdo(): ?PDO {
        return SqliteDatabase::getInstance()->getPdo();
    }

    public function findMany(): array {
        $pdo = $this->getPdo();
        if ($pdo === null) {
            return [];
        }

        $sql = "SELECT * FROM {$this->tableName}";
        if (!empty($this->whereClauses)) {
            $sql .= " WHERE " . implode(" AND ", $this->whereClauses);
        }
        if ($this->orderByClause !== null) {
            $sql .= " " . $this->orderByClause;
        }
        if ($this->limitCount !== null) {
            $sql .= " LIMIT {$this->limitCount}";
        }

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($this->whereParams);
            return $stmt->fetchAll();
        } catch (Throwable $e) {
            FileLogger::getInstance()->error("Orm findMany failed on {$this->tableName}: " . $e->getMessage());
            return [];
        }
    }

    public function findOne(): ?array {
        $this->limit(1);
        $rows = $this->findMany();
        return !empty($rows) ? $rows[0] : null;
    }

    public function insert(array $data): int {
        $pdo = $this->getPdo();
        if ($pdo === null) {
            return 0;
        }

        $columns = array_keys($data);
        $placeholders = array_fill(0, count($columns), '?');

        $sql = sprintf(
            "INSERT INTO %s (%s) VALUES (%s)",
            $this->tableName,
            implode(", ", $columns),
            implode(", ", $placeholders)
        );

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute(array_values($data));
            return (int) $pdo->lastInsertId();
        } catch (Throwable $e) {
            FileLogger::getInstance()->error("Orm insert failed on {$this->tableName}: " . $e->getMessage());
            return 0;
        }
    }

    public function update(int $id, array $data): int {
        $pdo = $this->getPdo();
        if ($pdo === null) {
            return 0;
        }

        $sets = [];
        $values = [];
        foreach ($data as $col => $val) {
            $sets[] = "{$col} = ?";
            $values[] = $val;
        }
        $values[] = $id;

        $sql = sprintf(
            "UPDATE %s SET %s, updated_at = datetime('now') WHERE id = ?",
            $this->tableName,
            implode(", ", $sets)
        );

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($values);
            return $stmt->rowCount();
        } catch (Throwable $e) {
            FileLogger::getInstance()->error("Orm update failed on {$this->tableName}: " . $e->getMessage());
            return 0;
        }
    }

    public function delete(int $id): int {
        $pdo = $this->getPdo();
        if ($pdo === null) {
            return 0;
        }

        $sql = "DELETE FROM {$this->tableName} WHERE id = ?";
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$id]);
            return $stmt->rowCount();
        } catch (Throwable $e) {
            FileLogger::getInstance()->error("Orm delete failed on {$this->tableName}: " . $e->getMessage());
            return 0;
        }
    }
}
