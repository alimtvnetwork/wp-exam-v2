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
    __DIR__ . '/unit/SqliteDatabaseTest.php',
    __DIR__ . '/unit/pluginbootstraptest.php',
    __DIR__ . '/unit/whatsappformattertest.php',
    __DIR__ . '/unit/countrycachetest.php',
    __DIR__ . '/unit/cycledetectortest.php',
    __DIR__ . '/unit/dynamicconditionalvalidationtest.php',
    __DIR__ . '/unit/splitdbisolationtest.php',
    __DIR__ . '/unit/draftresumetest.php',
    __DIR__ . '/unit/formjsonimportexporttest.php',
    __DIR__ . '/unit/formcontrollertest.php',
    __DIR__ . '/feature/formapitest.php',
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
    $baseName = basename($file, '.php');
    $pascalName = str_replace(' ', '', ucwords(str_replace(['-', '_'], ' ', $baseName)));

    $candidates = [
        'Tests\\Unit\\' . $pascalName,
        'Tests\\Feature\\' . $pascalName,
        'WpExam\\Tests\\' . $pascalName,
        'WpExam\\Tests\\' . $baseName,
        $pascalName,
    ];

    $className = '';
    foreach ($candidates as $cand) {
        if (class_exists($cand, false)) {
            $className = $cand;
            break;
        }
    }

    if (empty($className)) {
        echo "Class not found in {$file}\n";
        continue;
    }

    $reflector = new ReflectionClass($className);
    $instance = $reflector->newInstanceArgs(['test']);

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
