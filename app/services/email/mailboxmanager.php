<?php

declare(strict_types=1);

namespace App\Services\Email;

class MailboxManager
{
    /**
     * Retrieve local mailbox configuration derived from test-pass.json or defaults.
     *
     * @return array<string, mixed>
     */
    public static function getConfig(): array
    {
        $passFile = dirname(__DIR__, 3) . '/test-pass.json';
        $email = 'ai-agm-tool-v1@hire-seoexperts.com';
        $pass = '';

        $hasPassFile = file_exists($passFile);

        if ($hasPassFile) {
            $raw = file_get_contents($passFile);
            $data = json_decode((string) $raw, true);

            $hasEmail = (!empty($data['email']) && is_string($data['email']));

            if ($hasEmail) {
                $email = $data['email'];
            }

            $hasPass = (!empty($data['pass']) && is_string($data['pass']));

            if ($hasPass) {
                $pass = $data['pass'];
            }
        }

        $parts = explode('@', $email);
        $user = $parts[0] ?? 'ai-agm-tool-v1';
        $domain = $parts[1] ?? 'hire-seoexperts.com';
        $alias = "{$user} ({$domain})";

        return [
            'is_success' => true,
            'email' => $email,
            'pass' => $pass,
            'alias' => $alias,
            'domain' => $domain,
            'smtp_host' => 'mail.' . $domain,
            'smtp_port' => 465,
            'smtp_secure' => 'ssl',
            'imap_host' => 'mail.' . $domain,
            'imap_port' => 993,
        ];
    }

    /**
     * Test socket connectivity and SSL handshake against SMTP or IMAP hosts.
     *
     * @param string $host
     * @param int $port
     * @param string $secure
     * @param string $type
     * @param string $user
     * @param string $pass
     * @return array<string, mixed>
     */
    public static function verifyConnection(
        string $host,
        int $port,
        string $secure = 'ssl',
        string $type = 'smtp',
        string $user = '',
        string $pass = ''
    ): array {
        $startTime = microtime(true);
        $isSsl = ($secure === 'ssl');
        $prefix = $isSsl ? 'ssl://' : '';
        $target = $prefix . $host . ':' . $port;

        $ctx = stream_context_create([
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
            ],
        ]);

        $errno = 0;
        $errstr = '';
        $fp = @stream_socket_client(
            $target,
            $errno,
            $errstr,
            5.0,
            STREAM_CLIENT_CONNECT,
            $ctx
        );

        $isConnectionOpen = ($fp !== false && is_resource($fp));

        if (!$isConnectionOpen) {
            return [
                'is_success' => false,
                'is_fail' => true,
                'status' => 'error',
                'latency_ms' => round((microtime(true) - $startTime) * 1000),
                'message' => "Connection failed to {$target}: {$errstr} (errno: {$errno})",
            ];
        }

        stream_set_timeout($fp, 5);
        $greeting = trim((string) fgets($fp, 512));
        $latencyMs = round((microtime(true) - $startTime) * 1000);

        $hasCredentials = (!empty($user) && !empty($pass));

        if ($hasCredentials) {
            $isSmtp = ($type === 'smtp');

            if ($isSmtp) {
                fwrite($fp, "EHLO localhost\r\n");

                while ($line = fgets($fp, 512)) {
                    $hasSpaceSeparator = (substr($line, 3, 1) === ' ');

                    if ($hasSpaceSeparator) {
                        break;
                    }
                }

                fwrite($fp, "AUTH LOGIN\r\n");
                fgets($fp, 512);
                fwrite($fp, base64_encode($user) . "\r\n");
                fgets($fp, 512);
                fwrite($fp, base64_encode($pass) . "\r\n");
                $authResponse = trim((string) fgets($fp, 512));
                fwrite($fp, "QUIT\r\n");
                fclose($fp);

                $isAuthSuccess = (str_starts_with($authResponse, '235') || str_starts_with($authResponse, '250'));

                if ($isAuthSuccess) {
                    return [
                        'is_success' => true,
                        'is_fail' => false,
                        'status' => 'success',
                        'latency_ms' => $latencyMs,
                        'greeting' => $greeting,
                        'auth_response' => $authResponse,
                        'message' => "SMTP SSL authentication verified in {$latencyMs}ms",
                    ];
                }

                return [
                    'is_success' => false,
                    'is_fail' => true,
                    'status' => 'error',
                    'latency_ms' => $latencyMs,
                    'greeting' => $greeting,
                    'auth_response' => $authResponse,
                    'message' => "SMTP authentication rejected: {$authResponse}",
                ];
            }

            $isImap = ($type === 'imap');

            if ($isImap) {
                fwrite($fp, "A01 LOGIN {$user} \"{$pass}\"\r\n");
                $authResponse = trim((string) fgets($fp, 512));
                fwrite($fp, "A02 LOGOUT\r\n");
                fclose($fp);

                $isImapSuccess = (str_contains($authResponse, 'A01 OK'));

                if ($isImapSuccess) {
                    return [
                        'is_success' => true,
                        'is_fail' => false,
                        'status' => 'success',
                        'latency_ms' => $latencyMs,
                        'greeting' => $greeting,
                        'auth_response' => $authResponse,
                        'message' => "IMAP SSL authentication verified in {$latencyMs}ms",
                    ];
                }

                return [
                    'is_success' => false,
                    'is_fail' => true,
                    'status' => 'error',
                    'latency_ms' => $latencyMs,
                    'greeting' => $greeting,
                    'auth_response' => $authResponse,
                    'message' => "IMAP login rejected: {$authResponse}",
                ];
            }
        }

        fclose($fp);

        return [
            'is_success' => true,
            'is_fail' => false,
            'status' => 'success',
            'latency_ms' => $latencyMs,
            'greeting' => $greeting,
            'message' => "Socket connection verified to {$target} in {$latencyMs}ms",
        ];
    }
}
