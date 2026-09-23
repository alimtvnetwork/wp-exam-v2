<?php

declare(strict_types=1);

define('LARAVEL_START', microtime(true));

$maintenanceFile = __DIR__ . '/../storage/framework/down';
$hasMaintenance = file_exists($maintenanceFile);

if ($hasMaintenance) {
    http_response_code(503);
    echo 'Application under maintenance.';
    exit(0);
}

require_once __DIR__ . '/../tests/bootstrap.php';

use App\Routing\Route;

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Forwarded-For');

$isOptionsMethod = (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS');

if ($isOptionsMethod) {
    http_response_code(200);
    exit(0);
}

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/');

$publicFile = __DIR__ . $uri;
$isNotRoot = ($uri !== '/');

if ($isNotRoot) {
    $isFileExists = file_exists($publicFile);

    if ($isFileExists) {
        $isActualFile = is_file($publicFile);

        if ($isActualFile) {
            return false;
        }
    }
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$rawInput = file_get_contents('php://input');
$body = [];

$hasRawInput = !empty($rawInput);

if ($hasRawInput) {
    $decoded = json_decode($rawInput, true);
    $isArray = is_array($decoded);

    if ($isArray) {
        $body = $decoded;
    }
}

$hasEmptyBody = empty($body);

if ($hasEmptyBody) {
    $hasPost = !empty($_POST);

    if ($hasPost) {
        $body = $_POST;
    }
}

$hasGetAllHeaders = function_exists('getallheaders');
$headers = [];

if ($hasGetAllHeaders) {
    $headers = getallheaders() ?: [];
}

$isApiRoute = str_starts_with($uri, '/api/');

if ($isApiRoute) {
    $result = Route::dispatch($method, $uri, $body, $headers);

    http_response_code($result['status']);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($result['body'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit(0);
}

$distIndex = __DIR__ . '/../dist/index.html';
$hasDistIndex = file_exists($distIndex);

if ($hasDistIndex) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($distIndex);
    exit(0);
}

$rootIndex = __DIR__ . '/../index.html';
$hasRootIndex = file_exists($rootIndex);

if ($hasRootIndex) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($rootIndex);
    exit(0);
}

echo 'WP Exam Laravel Application Online.';
exit(0);
