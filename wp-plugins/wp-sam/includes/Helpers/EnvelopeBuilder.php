<?php
/**
 * Universal Response Envelope Builder.
 *
 * Implements standard envelope format inspired by Riseup Asia.
 *
 * @package WpExam\Helpers
 */

namespace WpExam\Helpers;

if (!defined('ABSPATH')) {
    exit;
}

use WpExam\Helpers\Traits\EnvelopeFactoryTrait;
use WpExam\Helpers\Traits\EnvelopeSettersTrait;
use WpExam\Helpers\Traits\EnvelopeBuildTrait;

class EnvelopeBuilder {
    use EnvelopeFactoryTrait;
    use EnvelopeSettersTrait;
    use EnvelopeBuildTrait;

    protected bool $isSuccess = true;
    protected int $code = 200;
    protected string $message = 'OK';
    protected array $results = [];
    protected bool $hasErrors = false;
    protected int $totalRecords = 0;
    protected int $perPage = 0;
    protected int $totalPages = 0;
    protected int $currentPage = 0;
    protected ?array $errors = null;
}
