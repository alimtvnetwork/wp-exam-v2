<?php
/**
 * Database Activation Handler for WP Exam.
 *
 * @package WpExam\Activation
 */

namespace WpExam\Activation;

if (!defined('ABSPATH')) {
    exit;
}

class ActivationHandler {
    public static function activate(): void {
        global $wpdb;

        $charsetCollate = $wpdb->get_charset_collate();

        $tableForms = $wpdb->prefix . 'wp_exam_forms';
        $tableFields = $wpdb->prefix . 'wp_exam_fields';
        $tableSubmissions = $wpdb->prefix . 'wp_exam_submissions';
        $tableLegacyQuizzes = $wpdb->prefix . 'wp_exam_quizzes';

        $sqlForms = "CREATE TABLE $tableForms (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            title varchar(255) NOT NULL,
            description text,
            form_type varchar(50) DEFAULT 'quiz',
            form_access varchar(50) DEFAULT 'public',
            is_sequential tinyint(1) DEFAULT 0,
            is_published tinyint(1) DEFAULT 1,
            settings_json longtext,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id)
        ) $charsetCollate;";

        $sqlFields = "CREATE TABLE $tableFields (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            form_id bigint(20) NOT NULL,
            field_type varchar(50) NOT NULL,
            field_label text NOT NULL,
            field_placeholder varchar(255) DEFAULT '',
            is_required tinyint(1) DEFAULT 0,
            display_order int(11) DEFAULT 0,
            options_json longtext,
            validation_json text,
            points int(11) DEFAULT 0,
            correct_answer text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY form_id (form_id)
        ) $charsetCollate;";

        $sqlSubmissions = "CREATE TABLE $tableSubmissions (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            form_id bigint(20) NOT NULL,
            user_id bigint(20) DEFAULT NULL,
            guest_email varchar(255) DEFAULT NULL,
            guest_name varchar(255) DEFAULT NULL,
            user_ip varchar(45) DEFAULT NULL,
            answers_json longtext NOT NULL,
            score int(11) DEFAULT NULL,
            total_possible_score int(11) DEFAULT NULL,
            is_passed tinyint(1) DEFAULT NULL,
            submitted_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY form_id (form_id),
            KEY user_id (user_id)
        ) $charsetCollate;";

        $sqlLegacy = "CREATE TABLE $tableLegacyQuizzes (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            title varchar(255) NOT NULL,
            description text,
            questions longtext,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id)
        ) $charsetCollate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sqlForms);
        dbDelta($sqlFields);
        dbDelta($sqlSubmissions);
        dbDelta($sqlLegacy);
    }
}
