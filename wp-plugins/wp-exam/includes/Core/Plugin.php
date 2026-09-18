<?php
/**
 * Main plugin coordinator.
 *
 * Follows RiseupAsia\Core\Plugin architecture.
 *
 * @package WpExam\Core
 */

namespace WpExam\Core;

if (!defined('ABSPATH')) {
    exit;
}

use Throwable;
use WpExam\Api\FormRestController;
use WpExam\Api\UserInviteRestController;
use WpExam\Api\EmailSettingsRestController;
use WpExam\Api\CompletionHistoryRestController;
use WpExam\Api\JsonImportExportRestController;
use WpExam\Database\SqliteDatabase;
use WpExam\Logging\FileLogger;
use WpExam\ErrorHandling\BootErrorCollector;

class Plugin {
    private static ?self $instance = null;
    private ?FormRestController $restController = null;
    private ?UserInviteRestController $inviteController = null;
    private ?EmailSettingsRestController $emailController = null;
    private ?CompletionHistoryRestController $historyController = null;
    private ?JsonImportExportRestController $importExportController = null;

    public static function getInstance(): self {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    private function __construct() {
        $this->initHooks();
    }

    private function initHooks(): void {
        try {
            // Initialize SQLite storage layer
            SqliteDatabase::getInstance()->init();

            // Register REST Controllers
            $this->restController = new FormRestController();
            $this->inviteController = new UserInviteRestController();
            $this->emailController = new EmailSettingsRestController();
            $this->historyController = new CompletionHistoryRestController();
            $this->importExportController = new JsonImportExportRestController();

            add_action('rest_api_init', [$this->restController, 'registerRoutes']);
            add_action('rest_api_init', [$this->inviteController, 'registerRoutes']);
            add_action('rest_api_init', [$this->emailController, 'registerRoutes']);
            add_action('rest_api_init', [$this->historyController, 'registerRoutes']);
            add_action('rest_api_init', [$this->importExportController, 'registerRoutes']);

            if (is_admin()) {
                if (class_exists('WP_Exam_Admin')) {
                    $admin = new \WP_Exam_Admin();
                    $admin->init();
                }
            }

            FileLogger::getInstance()->info('WP Exam core and SQLite subsystems initialized successfully');
        } catch (Throwable $e) {
            BootErrorCollector::getInstance()->addError('plugin_init', $e->getMessage());
            FileLogger::getInstance()->error('Plugin initialization failed: ' . $e->getMessage());
        }
    }

    public function getRestController(): ?FormRestController {
        return $this->restController;
    }
}
