<?php
/**
 * Field type enumeration.
 *
 * @package WpExam\Enums
 */

namespace WpExam\Enums;

if (!defined('ABSPATH')) {
    exit;
}

enum FieldType: string {
    case MultipleChoice = 'multiple_choice';
    case SingleChoice = 'single_choice';
    case TrueFalse = 'true_false';
    case ShortAnswer = 'short_answer';
    case Paragraph = 'paragraph';
    case Email = 'email';
    case Phone = 'phone';
    case Dropdown = 'dropdown';
    case Rating = 'rating';
    case FileUpload = 'file_upload';
}
