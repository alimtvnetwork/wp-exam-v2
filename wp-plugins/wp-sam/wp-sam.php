<?php
/**
 * Plugin Name:       WP Sam (WP Exam Modern Quiz & Form Engine)
 * Plugin URI:        https://github.com/alimtvnetwork/wp-exam-v2
 * Description:       A versatile, modern Quiz and Dynamic Form engine (Sequential Quizzes, Employee Sign-up forms, Surveys) using React, Less, and SQLite embedded storage.
 * Version:           2.1.0
 * Requires at least: 6.0
 * Requires PHP:      8.2
 * Author:            Antigravity Architect
 * Author URI:        https://github.com/alimtvnetwork
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       wp-sam
 *
 * @package WpSam
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!defined('WP_SAM_VERSION')) {
    define('WP_SAM_VERSION', '2.1.0');
}

// If standalone includes exist in this folder
if (file_exists(__DIR__ . '/includes/Autoloader.php')) {
    if (!defined('WP_SAM_PLUGIN_DIR')) {
        define('WP_SAM_PLUGIN_DIR', plugin_dir_path(__FILE__));
    }
    if (!defined('WP_SAM_PLUGIN_URL')) {
        define('WP_SAM_PLUGIN_URL', plugin_dir_url(__FILE__));
    }

    require_once WP_SAM_PLUGIN_DIR . 'includes/Autoloader.php';

    if (class_exists('WpExam\\Core\\Plugin')) {
        \WpExam\Core\Plugin::getInstance();
    }
} elseif (file_exists(__DIR__ . '/../wp-exam/wp-exam.php')) {
    require_once __DIR__ . '/../wp-exam/wp-exam.php';
} elseif (file_exists(dirname(__DIR__, 2) . '/wp-exam.php')) {
    require_once dirname(__DIR__, 2) . '/wp-exam.php';
}
