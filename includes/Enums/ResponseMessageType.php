<?php
/**
 * Response Message Type enumeration.
 *
 * @package WpExam\Enums
 */

namespace WpExam\Enums;

if (!defined('ABSPATH')) {
    exit;
}

enum ResponseMessageType: string {
    case Ok = 'OK';
    case Created = 'Resource created successfully';
    case Updated = 'Resource updated successfully';
    case Deleted = 'Resource deleted successfully';
    case NotFound = 'Resource not found';
    case Forbidden = 'Permission denied';
    case ValidationError = 'Validation failed';
    case DbQueryFailed = 'Database query failed';
    case SubmissionRecorded = 'Submission recorded successfully';
}
