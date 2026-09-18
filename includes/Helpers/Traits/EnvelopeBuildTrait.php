<?php
/**
 * EnvelopeBuildTrait - Assembly and WP_REST_Response output.
 *
 * @package WpExam\Helpers\Traits
 */

namespace WpExam\Helpers\Traits;

if (!defined('ABSPATH')) {
    exit;
}

use WP_REST_Response;
use WpExam\Helpers\DateHelper;

trait EnvelopeBuildTrait {
    public function build(): array {
        $envelope = [
            'Status'     => $this->buildStatusBlock(),
            'Attributes' => $this->buildAttributesBlock(),
            'Results'    => $this->results,
        ];

        $hasErrors = ($this->errors !== null);

        if ($hasErrors) {
            $envelope['Errors'] = $this->errors;
        }

        return $envelope;
    }

    private function buildStatusBlock(): array {
        $isFailed = !$this->isSuccess;

        return [
            'IsSuccess' => $this->isSuccess,
            'IsFailed'  => $isFailed,
            'Code'      => $this->code,
            'Message'   => $this->message,
            'Timestamp' => DateHelper::nowUtc(),
        ];
    }

    private function buildAttributesBlock(): array {
        $resultCount = count($this->results);
        $totalRecords = ($this->totalRecords > 0) ? $this->totalRecords : $resultCount;

        return [
            'RequestedAt'        => DateHelper::nowUtc(),
            'RequestDelegatedAt' => DateHelper::nowUtc(),
            'HasAnyErrors'       => $this->hasErrors,
            'IsSingle'           => ($resultCount === 1),
            'IsMultiple'         => ($resultCount > 1),
            'TotalRecords'       => $totalRecords,
            'PerPage'            => $this->perPage,
            'TotalPages'         => $this->totalPages,
            'CurrentPage'        => $this->currentPage,
        ];
    }

    public function toRestResponse(): WP_REST_Response {
        return new WP_REST_Response($this->build(), $this->code);
    }
}
