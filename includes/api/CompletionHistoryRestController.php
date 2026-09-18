<?php
/**
 * REST API Controller for Quiz & Form Completion History.
 *
 * @package WpExam\Api
 */

declare(strict_types=1);

namespace WpExam\Api;

if (!defined('ABSPATH')) {
    exit;
}

use WP_REST_Controller;
use WP_REST_Server;
use WP_REST_Request;
use WP_REST_Response;
use WpExam\Database\Orm;
use WpExam\Helpers\EnvelopeBuilder;
use WpExam\Enums\HttpStatusType;
use WpExam\Enums\ResponseMessageType;

class CompletionHistoryRestController extends WP_REST_Controller {
    protected string $namespace = 'wp-exam/v1';

    public function registerRoutes(): void {
        register_rest_route($this->namespace, '/admin/history', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'getHistoryList'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
        ]);

        register_rest_route($this->namespace, '/admin/history/(?P<id>\d+)', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'getSubmissionDetail'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
        ]);
    }

    public function checkAdminPermission(): bool {
        return current_user_can('manage_options');
    }

    public function getHistoryList(WP_REST_Request $request): WP_REST_Response {
        $submissions = Orm::forTable('form_submissions')
            ->orderBy('id', 'DESC')
            ->limit(100)
            ->findMany();

        $hasNoSubmissions = empty($submissions);

        if ($hasNoSubmissions) {
            global $wpdb;
            $tableSubmissions = $wpdb->prefix . 'wp_exam_submissions';
            $rows = $wpdb->get_results("SELECT * FROM $tableSubmissions ORDER BY id DESC LIMIT 100", ARRAY_A);
            $hasWpRows = !empty($rows);

            if ($hasWpRows) {
                $submissions = $rows;
            }
        }

        $builder = EnvelopeBuilder::createSuccess($submissions, HttpStatusType::Ok->value, ResponseMessageType::Ok->value);

        return new WP_REST_Response($builder->build(), HttpStatusType::Ok->value);
    }

    public function getSubmissionDetail(WP_REST_Request $request): WP_REST_Response {
        $id = (int) $request->get_param('id');
        $submission = Orm::forTable('form_submissions')->where('id', $id)->findOne();

        if ($submission === null) {
            $builder = EnvelopeBuilder::createError('Submission not found', HttpStatusType::NotFound->value);
            return new WP_REST_Response($builder->build(), HttpStatusType::NotFound->value);
        }

        $answers = Orm::forTable('form_answers')->where('submission_id', $id)->findMany();
        $submission['answers'] = $answers;

        $builder = EnvelopeBuilder::createSuccess($submission, HttpStatusType::Ok->value, ResponseMessageType::Ok->value);
        return new WP_REST_Response($builder->build(), HttpStatusType::Ok->value);
    }
}
