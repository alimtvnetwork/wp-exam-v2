<?php
/**
 * Remote Plugin Uploader Client.
 * Uploads packaged WordPress plugins to a remote server using the Rise Up Asia uploader REST API.
 *
 * Usage:
 *   php scripts/uploader.php --host=https://example.com --user=admin --password=app-password-here --file=dist/wp-exam.zip --activate
 *
 * Environment variable fallbacks:
 *   WP_REMOTE_HOST, WP_REMOTE_USER, WP_REMOTE_PASS, WP_REMOTE_TOKEN
 */

declare(strict_types=1);

$options = getopt('', [
    'host:',
    'user::',
    'password::',
    'token::',
    'file:',
    'activate::',
    'help::',
]);

if (isset($options['help'])) {
    echo "Rise Up Asia Plugin Remote Uploader\n";
    echo "====================================\n";
    echo "Options:\n";
    echo "  --host=<url>        Target WordPress base URL (e.g. https://example.com)\n";
    echo "  --user=<username>   WordPress admin username (for App Password auth)\n";
    echo "  --password=<pass>   WordPress Application Password\n";
    echo "  --token=<bearer>    Bearer authentication token\n";
    echo "  --file=<path>       Path to plugin zip archive (e.g. dist/wp-exam.zip)\n";
    echo "  --activate          Automatically activate plugin after upload\n\n";
    exit(0);
}

$host = $options['host'] ?? getenv('WP_REMOTE_HOST') ?: '';
$user = $options['user'] ?? getenv('WP_REMOTE_USER') ?: '';
$password = $options['password'] ?? getenv('WP_REMOTE_PASS') ?: '';
$token = $options['token'] ?? getenv('WP_REMOTE_TOKEN') ?: '';
$file = $options['file'] ?? '';
$isActivate = isset($options['activate']);

if (empty($host) || empty($file)) {
    echo "Error: --host and --file are required. Run with --help for details.\n";
    exit(1);
}

$resolvedFile = realpath($file);
$hasFile = ($resolvedFile !== false && file_exists($resolvedFile));

if ($hasFile) {
    // Target package archive verified
} else {
    echo "Error: File not found: {$file}\n";
    exit(1);
}

$host = rtrim($host, '/');
echo "Connecting to remote WordPress host: {$host}\n";

// Setup cURL headers
$headers = ['Accept: application/json'];
if (!empty($token)) {
    $headers[] = 'Authorization: Bearer ' . $token;
} elseif (!empty($user) && !empty($password)) {
    $auth = base64_encode("{$user}:{$password}");
    $headers[] = 'Authorization: Basic ' . $auth;
}

// 1. Connectivity Ping
$ch = curl_init("{$host}/wp-json/");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_TIMEOUT => 15,
    CURLOPT_SSL_VERIFYPEER => false,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode >= 400 || $response === false) {
    echo "Warning: Health ping returned HTTP {$httpCode}. Attempting upload anyway...\n";
} else {
    echo "  ✓ Remote WordPress REST API reachable (HTTP {$httpCode}).\n";
}

// 2. Upload Plugin Archive
$uploadEndpoints = [
    "{$host}/wp-json/riseup/v1/plugins/upload",
    "{$host}/wp-json/wp-exam/v1/plugins/upload",
    "{$host}/wp-json/wp/v2/plugins",
];

$curlFile = new CURLFile($resolvedFile, 'application/zip', basename($resolvedFile));
$postFields = [
    'plugin_zip' => $curlFile,
    'file' => $curlFile,
    'activate' => $isActivate ? '1' : '0',
    'overwrite' => '1',
];

$isSuccess = false;

foreach ($uploadEndpoints as $endpoint) {
    echo "Attempting upload to {$endpoint}...\n";

    $ch = curl_init($endpoint);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $postFields,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 60,
        CURLOPT_SSL_VERIFYPEER => false,
    ]);

    $uploadResult = curl_exec($ch);
    $uploadCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($uploadCode >= 200 && $uploadCode < 300) {
        echo "  ✓ Plugin uploaded successfully (HTTP {$uploadCode})!\n";
        echo "Server response: {$uploadResult}\n";
        $isSuccess = true;
        break;
    }

    echo "  ! Endpoint returned HTTP {$uploadCode}: {$uploadResult}\n";
}

if ($isSuccess) {
    echo "\nRemote deployment completed successfully!\n";
    exit(0);
}

echo "\nUpload failed across all endpoints. Ensure remote server has riseup-asia-uploader or wp-exam active.\n";
exit(1);
