<?php
/**
 * EnvelopeFactoryTrait - Factory constructors for EnvelopeBuilder.
 *
 * @package WpExam\Helpers\Traits
 */

namespace WpExam\Helpers\Traits;

if (!defined('ABSPATH')) {
    exit;
}

use WpExam\Enums\HttpStatusType;
use WpExam\Enums\ResponseMessageType;

trait EnvelopeFactoryTrait {
    public static function createSuccess(
        mixed $results = [],
        int $code = 200,
        string $message = 'OK',
    ): self {
        $builder = new self();
        $builder->isSuccess = true;
        $builder->code = $code;
        $builder->message = $message;

        $isArray = is_array($results);

        if ($isArray) {
            $builder->results = $results;
        } else {
            $builder->results = [$results];
        }

        return $builder;
    }

    public static function createError(
        string $message,
        int $code = 400,
        ?array $errors = null,
    ): self {
        $builder = new self();
        $builder->isSuccess = false;
        $builder->code = $code;
        $builder->message = $message;
        $builder->hasErrors = true;
        $builder->results = [];
        $builder->errors = $errors;

        return $builder;
    }

    public static function createNotFound(string $message = 'Resource not found'): self {
        return self::createError($message, HttpStatusType::NotFound->value);
    }
}
