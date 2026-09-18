<?php
/**
 * Legacy activator bridge for backward compatibility.
 * Delegates to WpExam\Activation\ActivationHandler.
 *
 * @package WpExam
 */

if (!defined('ABSPATH')) {
    exit;
}

use WpExam\Activation\ActivationHandler;

class WP_Exam_Activator {
    public static function activate(): void {
        ActivationHandler::activate();
    }
}
