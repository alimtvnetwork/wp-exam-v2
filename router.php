<?php

declare(strict_types=1);

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/');

$isNotRoot = ($uri !== '/');

if ($isNotRoot) {
    $isFileExists = file_exists(__DIR__ . $uri);

    if ($isFileExists) {
        return false;
    }
}

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Forwarded-For');

$isOptionsMethod = (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS');

if ($isOptionsMethod) {
    http_response_code(200);
    exit(0);
}

require_once __DIR__ . '/tests/bootstrap.php';

use App\Routing\Route;

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

$result = Route::dispatch($method, $uri, $body, $headers);

http_response_code($result['status']);
header('Content-Type: application/json; charset=utf-8');
echo json_encode($result['body'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
exit(0);
