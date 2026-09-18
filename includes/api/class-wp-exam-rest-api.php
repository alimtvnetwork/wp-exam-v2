<?php
/**
 * Legacy REST API Wrapper for WP Exam.
 * Delegates to WpExam\Api\FormRestController.
 *
 * @package WpExam
 */

if (!defined('ABSPATH')) {
    exit;
}

use WpExam\Api\FormRestController;

class WP_Exam_REST_API {
    private FormRestController $controller;

    public function __construct() {
        $this->controller = new FormRestController();
    }

    public function init(): void {
        add_action('rest_api_init', [$this->controller, 'registerRoutes']);
    }

    public function register_routes(): void {
        $this->controller->registerRoutes();
    }

    public function check_permission(): bool {
        return $this->controller->checkAdminPermission();
    }
}
