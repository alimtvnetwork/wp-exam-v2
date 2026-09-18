<?php
/**
 * Form type enumeration.
 *
 * @package WpExam\Enums
 */

namespace WpExam\Enums;

if (!defined('ABSPATH')) {
    exit;
}

enum FormType: string {
    case Quiz = 'quiz';
    case EmployeeSignup = 'employee_signup';
    case Survey = 'survey';
    case GeneralForm = 'general_form';
}
