<?php
/**
 * Form access level enumeration.
 *
 * @package WpExam\Enums
 */

namespace WpExam\Enums;

if (!defined('ABSPATH')) {
    exit;
}

enum FormAccessType: string {
    case Public = 'public';
    case Authenticated = 'authenticated';
    case AdminOnly = 'admin_only';
}
