<?php
/**
 * Standalone test runner for WP Exam unit tests.
 * Runs in environments with standard PHP CLI without requiring Composer or PHPUnit binary.
 */

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$testFiles = [
    __DIR__ . '/unit/EnvelopeBuilderTest.php',
    __DIR__ . '/unit/WpDbQueryWrapperTest.php',
];

$passed = 0;
$failed = 0;
$start = microtime(true);

echo "WP Exam PHP Test Suite\n";
echo "======================\n\n";

foreach ($testFiles as $file) {
    if (!file_exists($file)) {
        echo "File not found: {$file}\n";
        continue;
    }

    require_once $file;
    $className = 'WpExam\\Tests\\' . basename($file, '.php');

    if (!class_exists($className)) {
        echo "Class not found in {$file}: {$className}\n";
        continue;
    }

    $reflector = new ReflectionClass($className);
    $instance = new $className();

    echo "Running {$className}...\n";

    foreach ($reflector->getMethods(ReflectionMethod::IS_PUBLIC) as $method) {
        if (!str_starts_with($method->getName(), 'test')) {
            continue;
        }

        try {
            $method->invoke($instance);
            echo "  ✓ {$method->getName()}\n";
            $passed++;
        } catch (Throwable $e) {
            echo "  ✗ {$method->getName()}: " . $e->getMessage() . "\n";
            $failed++;
        }
    }
    echo "\n";
}

$elapsed = round(microtime(true) - $start, 3);
echo "----------------------------------------\n";
echo "Tests: {$passed} passed, {$failed} failed (in {$elapsed}s)\n";

if ($failed > 0) {
    exit(1);
}

exit(0);
