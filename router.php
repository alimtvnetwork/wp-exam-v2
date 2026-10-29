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
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Forwarded-For, X-WPExam-Auth-Token');

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

$hasGet = !empty($_GET);

if ($hasGet) {
    $body = array_merge($_GET, $body);
}

$hasGetAllHeaders = function_exists('getallheaders');
$headers = [];

if ($hasGetAllHeaders) {
    $headers = getallheaders() ?: [];
}

$hasServerAuth = isset($_SERVER['HTTP_AUTHORIZATION']);

if ($hasServerAuth) {
    $headers['Authorization'] = $_SERVER['HTTP_AUTHORIZATION'];
}

$hasServerWpToken = isset($_SERVER['HTTP_X_WPEXAM_AUTH_TOKEN']);

if ($hasServerWpToken) {
    $headers['X-WPExam-Auth-Token'] = $_SERVER['HTTP_X_WPEXAM_AUTH_TOKEN'];
}

$result = Route::dispatch($method, $uri, $body, $headers);

http_response_code($result['status']);
header('Content-Type: application/json; charset=utf-8');
echo json_encode($result['body'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
exit(0);
