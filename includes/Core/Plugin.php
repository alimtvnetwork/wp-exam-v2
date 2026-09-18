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
use WpExam\Logging\FileLogger;
use WpExam\ErrorHandling\BootErrorCollector;

class Plugin {
    private static ?self $instance = null;
    private ?FormRestController $restController = null;

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
            $this->restController = new FormRestController();
            add_action('rest_api_init', [$this->restController, 'registerRoutes']);

            if (is_admin()) {
                if (class_exists('WP_Exam_Admin')) {
                    $admin = new \WP_Exam_Admin();
                    $admin->init();
                }
            }

            FileLogger::getInstance()->info('WP Exam core initialized successfully');
        } catch (Throwable $e) {
            BootErrorCollector::getInstance()->addError('plugin_init', $e->getMessage());
            FileLogger::getInstance()->error('Plugin initialization failed: ' . $e->getMessage());
        }
    }

    public function getRestController(): ?FormRestController {
        return $this->restController;
    }
}
