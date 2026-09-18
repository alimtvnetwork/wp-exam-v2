<?php
/**
 * PSR-4 Autoloader for the WpExam namespace.
 *
 * Maps the WpExam\ namespace prefix to the includes/ directory.
 * Self-contained without external dependencies.
 *
 * @package WpExam
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('WpExamAutoloader', false)) {
    final class WpExamAutoloader {
    private const NAMESPACE_PREFIX = 'WpExam\\';
    private const PREFIX_LENGTH = 7;
    private const LOG_PREFIX = '[WP Exam] Autoloader: ';

    /** @var array<int, array{class: string, file: string, error: string}> */
    private static array $failedClasses = [];

    public static function register(): void {
        spl_autoload_register([self::class, 'load']);
    }

    private static function load(string $class): void {
        $isOutsideNamespace = (strncmp($class, self::NAMESPACE_PREFIX, self::PREFIX_LENGTH) !== 0);

        if ($isOutsideNamespace) {
            return;
        }

        $relativeClass = substr($class, self::PREFIX_LENGTH);
        $file = __DIR__ . '/' . str_replace('\\', '/', $relativeClass) . '.php';

        $isFileMissing = !file_exists($file);

        if ($isFileMissing) {
            $lowerFile = __DIR__ . '/' . strtolower(str_replace('\\', '/', $relativeClass)) . '.php';
            $hasLowerFile = file_exists($lowerFile);
            if ($hasLowerFile) {
                $file = $lowerFile;
                $isFileMissing = false;
            }
        }

        if ($isFileMissing) {
            $errorMsg = 'File not found';
            error_log(self::LOG_PREFIX . 'class file not found for "' . $class . '" - expected at "' . $file . '"');
            self::$failedClasses[] = ['class' => $class, 'file' => $file, 'error' => $errorMsg];
            self::reportToBootCollector('autoloader', 'Class file not found: ' . $class . ' - expected at ' . $file);

            return;
        }

        try {
            require_once $file;
        } catch (Throwable $e) {
            error_log(self::LOG_PREFIX . 'failed to load "' . $class . '" - ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            self::$failedClasses[] = ['class' => $class, 'file' => $file, 'error' => $e->getMessage()];
            self::reportToBootCollector('autoloader', 'Failed to load ' . $class . ': ' . $e->getMessage());
        }
    }

    /**
     * @return array<int, array{class: string, file: string, error: string}>
     */
    public static function getFailedClasses(): array {
        return self::$failedClasses;
    }

    private static function reportToBootCollector(string $context, string $message): void {
        $isCollectorLoaded = class_exists('WpExam\\ErrorHandling\\BootErrorCollector', false);

        if ($isCollectorLoaded) {
            \WpExam\ErrorHandling\BootErrorCollector::getInstance()->addError($context, $message);
        }
    }
}
}

WpExamAutoloader::register();
