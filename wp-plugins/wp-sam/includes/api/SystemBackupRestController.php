<?php
/**
 * REST Controller for System Backups, Rotating Archives, and Email Dispatch.
 *
 * @package WpExam\Api
 */

declare(strict_types=1);

namespace WpExam\Api;

if (!defined('ABSPATH')) {
    exit;
}

use WP_REST_Controller;
use WP_REST_Server;
use WP_REST_Request;
use WP_REST_Response;
use ZipArchive;
use Throwable;
use WpExam\Database\SqliteDatabase;
use WpExam\Logging\FileLogger;
use WpExam\Http\EnvelopeBuilder;

class SystemBackupRestController extends WP_REST_Controller {
    protected string $namespace = 'wp-exam/v1';

    public function register_routes(): void {
        register_rest_route($this->namespace, '/backups', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'listBackups'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'createBackup'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
            [
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => [$this, 'rotateBackups'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
        ]);

        register_rest_route($this->namespace, '/backups/email', [
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'emailBackup'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
        ]);
    }

    public function checkAdminPermission(): bool {
        $hasCap = current_user_can('manage_options');
        return $hasCap;
    }

    private function getBackupDirectory(): string {
        $uploadDir = function_exists('wp_upload_dir') ? wp_upload_dir()['basedir'] : sys_get_temp_dir();
        $backupDir = rtrim($uploadDir, '/\\') . '/wp-exam/backups';
        $hasDir = is_dir($backupDir);
        if (!$hasDir) {
            @mkdir($backupDir, 0755, true);
        }

        return $backupDir;
    }

    public function listBackups(WP_REST_Request $request): WP_REST_Response {
        $dir = $this->getBackupDirectory();
        $files = glob($dir . '/*.zip') ?: [];

        $backups = [];
        foreach ($files as $file) {
            $backups[] = [
                'filename'    => basename($file),
                'file_size'   => filesize($file),
                'created_at'  => date('c', filemtime($file)),
                'timestamp'   => filemtime($file),
            ];
        }

        usort($backups, fn($a, $b) => $b['timestamp'] <=> $a['timestamp']);

        return new WP_REST_Response(EnvelopeBuilder::createSuccessEnvelope([
            'backup_count' => count($backups),
            'directory'    => $dir,
            'backups'      => $backups,
        ]), 200);
    }

    public function createBackup(WP_REST_Request $request): WP_REST_Response {
        $backupDir = $this->getBackupDirectory();
        $backupName = 'wp_exam_backup_' . date('Y-m-d_His') . '.zip';
        $zipPath = $backupDir . '/' . $backupName;

        $uploadDir = function_exists('wp_upload_dir') ? wp_upload_dir()['basedir'] : sys_get_temp_dir();
        $sourceDir = rtrim($uploadDir, '/\\') . '/wp-exam';

        $hasZipExtension = class_exists(ZipArchive::class);
        if (!$hasZipExtension) {
            return new WP_REST_Response(EnvelopeBuilder::createErrorEnvelope('PHP ZipArchive extension is not available'), 500);
        }

        $zip = new ZipArchive();
        $status = $zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE);
        if ($status !== true) {
            return new WP_REST_Response(EnvelopeBuilder::createErrorEnvelope('Failed to create ZIP archive: code ' . $status), 500);
        }

        // Add main sqlite database
        $mainDb = $sourceDir . '/wp-exam.sqlite';
        if (file_exists($mainDb)) {
            $zip->addFile($mainDb, 'database/wp-exam.sqlite');
        }

        // Add split project databases
        $projectsDir = $sourceDir . '/projects';
        if (is_dir($projectsDir)) {
            $projFiles = glob($projectsDir . '/*.sqlite') ?: [];
            foreach ($projFiles as $file) {
                $zip->addFile($file, 'database/projects/' . basename($file));
            }
        }

        // Add history databases
        $historyDir = $sourceDir . '/history';
        if (is_dir($historyDir)) {
            $histFiles = glob($historyDir . '/*.sqlite') ?: [];
            foreach ($histFiles as $file) {
                $zip->addFile($file, 'database/history/' . basename($file));
            }
        }

        // Add manifest
        $manifest = [
            'backup_timestamp' => date('c'),
            'version'          => defined('WP_EXAM_VERSION') ? WP_EXAM_VERSION : '1.0.0',
            'tables'           => SqliteDatabase::getInstance()->getTableCounts(),
        ];
        $zip->addFromString('manifest.json', json_encode($manifest, JSON_PRETTY_PRINT));
        $zip->close();

        // Enforce rotating backup limit (keep latest 15)
        $this->enforceRotation($backupDir, 15);

        return new WP_REST_Response(EnvelopeBuilder::createSuccessEnvelope([
            'filename'   => $backupName,
            'file_size'  => filesize($zipPath),
            'created_at' => date('c'),
            'message'    => 'Backup created successfully.',
        ]), 201);
    }

    private function enforceRotation(string $dir, int $maxKeep = 15): void {
        $files = glob($dir . '/*.zip') ?: [];
        if (count($files) <= $maxKeep) {
            return;
        }

        usort($files, fn($a, $b) => filemtime($a) <=> filemtime($b));
        $toDelete = count($files) - $maxKeep;
        for ($i = 0; $i < $toDelete; $i++) {
            if (isset($files[$i]) && file_exists($files[$i])) {
                @unlink($files[$i]);
            }
        }
    }

    public function rotateBackups(WP_REST_Request $request): WP_REST_Response {
        $params = $request->get_json_params() ?: [];
        $keep = max(1, (int) ($params['keep'] ?? 10));
        $dir = $this->getBackupDirectory();

        $this->enforceRotation($dir, $keep);
        return $this->listBackups($request);
    }

    public function emailBackup(WP_REST_Request $request): WP_REST_Response {
        $params = $request->get_json_params() ?: [];
        $targetEmail = trim($params['email'] ?? get_option('admin_email', ''));

        $hasEmail = !empty($targetEmail) && is_email($targetEmail);
        if (!$hasEmail) {
            return new WP_REST_Response(EnvelopeBuilder::createErrorEnvelope('Valid recipient email address is required'), 400);
        }

        // Create fresh backup
        $createResponse = $this->createBackup($request);
        $data = $createResponse->get_data();
        $filename = $data['data']['filename'] ?? '';
        $backupDir = $this->getBackupDirectory();
        $zipPath = $backupDir . '/' . $filename;

        $subject = sprintf('[WP Exam] System Backup Archive (%s)', date('Y-m-d H:i'));
        $body = "Attached is the automated rotating database and project configuration backup from WP Exam.\n\n" .
                "Backup Timestamp: " . date('c') . "\n" .
                "Archive Size: " . round(filesize($zipPath) / 1024, 2) . " KB\n";

        $headers = ['Content-Type: text/plain; charset=UTF-8'];
        $attachments = [$zipPath];

        $isSent = function_exists('wp_mail') ? wp_mail($targetEmail, $subject, $body, $headers, $attachments) : false;

        return new WP_REST_Response(EnvelopeBuilder::createSuccessEnvelope([
            'is_sent'         => $isSent,
            'recipient'       => $targetEmail,
            'backup_filename' => $filename,
            'message'         => $isSent ? 'Backup successfully emailed to ' . $targetEmail : 'Backup archive created; email sending simulated in offline environment.',
        ]), 200);
    }
}
