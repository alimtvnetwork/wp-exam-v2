<?php
/**
 * HTTP Status Type enumeration.
 *
 * @package WpExam\Enums
 */

namespace WpExam\Enums;

if (!defined('ABSPATH')) {
    exit;
}

enum HttpStatusType: int {
    case Ok = 200;
    case Created = 201;
    case Accepted = 202;
    case BadRequest = 400;
    case Unauthorized = 401;
    case Forbidden = 403;
    case NotFound = 404;
    case MethodNotAllowed = 405;
    case Conflict = 409;
    case UnprocessableEntity = 422;
    case InternalServerError = 500;
}
