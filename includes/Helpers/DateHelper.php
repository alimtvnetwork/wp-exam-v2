<?php
/**
 * Date and time helper.
 *
 * @package WpExam\Helpers
 */

namespace WpExam\Helpers;

if (!defined('ABSPATH')) {
    exit;
}

use DateTimeImmutable;
use DateTimeZone;

final class DateHelper {
    public static function nowUtc(): string {
        $now = new DateTimeImmutable('now', new DateTimeZone('UTC'));

        return $now->format('Y-m-d\TH:i:s\Z');
    }
}
