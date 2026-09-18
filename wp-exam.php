<?php
/**
 * Plugin Name: WP Exam
 * Description: A modern quiz and exam builder using React and standard WP REST API.
 * Version: 1.0.0
 * Author: Coding Guidelines
 * Text Domain: wp-exam
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

define( 'WP_EXAM_VERSION', '1.0.0' );
define( 'WP_EXAM_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'WP_EXAM_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Include necessary classes
require_once WP_EXAM_PLUGIN_DIR . 'includes/class-wp-exam-activator.php';
require_once WP_EXAM_PLUGIN_DIR . 'includes/api/class-wp-exam-rest-api.php';
require_once WP_EXAM_PLUGIN_DIR . 'includes/class-wp-exam-admin.php';

// Activation Hook
register_activation_hook( __FILE__, array( 'WP_Exam_Activator', 'activate' ) );

// Initialize components
function run_wp_exam() {
    $api = new WP_Exam_REST_API();
    $api->init();

    $admin = new WP_Exam_Admin();
    $admin->init();
}

run_wp_exam();
