<?php
/**
 * Plugin Name: WP Exam
 * Plugin URI: https://github.com/alimtvnetwork/wp-exam-v2
 * Description: A versatile, modern Quiz and Dynamic Form engine (Sequential Quizzes, Employee Sign-up forms, Surveys) using React and standard WP REST API.
 * Version: 2.0.0
 * Author: Coding Guidelines
 * Text Domain: wp-exam
 * Requires PHP: 8.2
 *
 * @package WpExam
 */

if (!defined('ABSPATH')) {
    exit;
}

define('WP_EXAM_VERSION', '2.0.0');
define('WP_EXAM_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('WP_EXAM_PLUGIN_URL', plugin_dir_url(__FILE__));

// PSR-4 Autoloader - all WpExam\ classes resolve automatically
require_once WP_EXAM_PLUGIN_DIR . 'includes/Autoloader.php';

// Legacy includes for backward compatibility
require_once WP_EXAM_PLUGIN_DIR . 'includes/class-wp-exam-activator.php';
require_once WP_EXAM_PLUGIN_DIR . 'includes/api/class-wp-exam-rest-api.php';
require_once WP_EXAM_PLUGIN_DIR . 'includes/class-wp-exam-admin.php';

use WpExam\Activation\ActivationHandler;
use WpExam\Api\FormRestController;
use WpExam\ErrorHandling\BootErrorCollector;

// Activation Hook
register_activation_hook(__FILE__, [ActivationHandler::class, 'activate']);

/**
 * Initialize WP Exam Plugin components.
 */
function run_wp_exam(): void {
    try {
        $restController = new FormRestController();
        add_action('rest_api_init', [$restController, 'registerRoutes']);

        if (is_admin()) {
            $admin = new WP_Exam_Admin();
            $admin->init();
        }
    } catch (Throwable $e) {
        BootErrorCollector::getInstance()->addError('plugin_init', $e->getMessage() . "\n" . $e->getTraceAsString());
    }
}

run_wp_exam();
