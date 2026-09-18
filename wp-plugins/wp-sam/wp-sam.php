<?php
/**
 * Plugin Name:       WP Sam (WP Exam Modern Quiz & Form Engine)
 * Plugin URI:        https://github.com/alimtvnetwork/wp-exam-v2
 * Description:       Compatibility entry point for WP Sam. Provides sequential quizzes, employee onboarding sign-ups, and SQLite embedded storage.
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

// Load primary WP Exam engine from wp-plugins/wp-exam/ or root
if (file_exists(__DIR__ . '/../wp-exam/wp-exam.php')) {
    require_once __DIR__ . '/../wp-exam/wp-exam.php';
} elseif (file_exists(dirname(__DIR__, 2) . '/wp-exam.php')) {
    require_once dirname(__DIR__, 2) . '/wp-exam.php';
}
