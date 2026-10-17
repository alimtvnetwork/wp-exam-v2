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

use WpExam\Core\Plugin;
use WpExam\Activation\ActivationHandler;
use WpExam\ErrorHandling\BootErrorCollector;

// Activation Hook
register_activation_hook(__FILE__, [ActivationHandler::class, 'activate']);

/**
 * Initialize WP Exam Plugin components.
 */
function run_wp_exam(): void {
    try {
        Plugin::getInstance();
    } catch (Throwable $e) {
        BootErrorCollector::getInstance()->addError('plugin_init', $e->getMessage() . "\n" . $e->getTraceAsString());
    }
}

run_wp_exam();

/**
 * Task-06: candidate checklist endpoints + reminder cron.
 *
 * The checklist REST routes are registered here (rather than in
 * includes/Core/Plugin.php) to keep this program's file ownership disjoint.
 * The WP-Cron job sends one reminder email per candidate per day for pending
 * items due within 48 hours.
 */
add_action('rest_api_init', function (): void {
    (new \WpExam\Api\ChecklistRestController())->registerRoutes();
});

add_action('wp_exam_checklist_reminder', function (): void {
    (new \WpExam\Api\ChecklistRestController())->sendDueReminders();
});

if (function_exists('wp_next_scheduled') && !wp_next_scheduled('wp_exam_checklist_reminder')) {
    wp_schedule_event(time(), 'daily', 'wp_exam_checklist_reminder');
}

/**
 * Task-08: video upload endpoint for `video_prompt` questions.
 *
 * Registered here (rather than in includes/Core/Plugin.php) to keep this
 * program's file ownership disjoint. Server-side: upload_files capability,
 * video/mp4 + video/webm allowlist, 128 MB cap (filterable).
 */
add_action('rest_api_init', function (): void {
    (new \WpExam\Api\MediaUploadRestController())->registerRoutes();
});
