<?php
/**
 * REST API Controller for JSON Import/Export & SQLite Status.
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
use WpExam\Database\SqliteDatabase;
use WpExam\Helpers\EnvelopeBuilder;
use WpExam\Enums\HttpStatusType;
use WpExam\Enums\ResponseMessageType;

class JsonImportExportRestController extends WP_REST_Controller {
    protected string $namespace = 'wp-exam/v1';

    public function registerRoutes(): void {
        register_rest_route($this->namespace, '/admin/export', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'exportData'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
        ]);

        register_rest_route($this->namespace, '/admin/import', [
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'importData'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
        ]);

        register_rest_route($this->namespace, '/admin/sqlite/status', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'getSqliteStatus'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
        ]);
    }

    public function checkAdminPermission(): bool {
        return current_user_can('manage_options');
    }

    public function exportData(WP_REST_Request $request): WP_REST_Response {
        $forms = Orm::forTable('forms')->findMany();
        $exportPayload = [
            'version'     => '2.0.0',
            'exported_at' => gmdate('c'),
            'forms'       => array_map(function ($f) {
                $fields = Orm::forTable('form_fields')->where('form_id', $f['id'])->findMany();
                $f['fields'] = $fields;
                return $f;
            }, $forms),
        ];

        $builder = EnvelopeBuilder::createSuccess($exportPayload, HttpStatusType::Ok->value, ResponseMessageType::Ok->value);
        return new WP_REST_Response($builder->build(), HttpStatusType::Ok->value);
    }

    public function importData(WP_REST_Request $request): WP_REST_Response {
        $rawJson = $request->get_param('json_data');
        $payload = is_array($rawJson) ? $rawJson : json_decode((string) $rawJson, true);

        if (!is_array($payload) || empty($payload['forms'])) {
            $builder = EnvelopeBuilder::createError('Invalid JSON format or missing forms array', HttpStatusType::BadRequest->value);
            return new WP_REST_Response($builder->build(), HttpStatusType::BadRequest->value);
        }

        $importedCount = 0;
        foreach ($payload['forms'] as $formData) {
            $newFormId = Orm::forTable('forms')->insert([
                'title'         => sanitize_text_field($formData['title'] ?? 'Imported Form'),
                'description'   => sanitize_textarea_field($formData['description'] ?? ''),
                'form_type'     => sanitize_text_field($formData['form_type'] ?? 'general_form'),
                'form_access'   => sanitize_text_field($formData['form_access'] ?? 'public'),
                'is_sequential' => !empty($formData['is_sequential']) ? 1 : 0,
                'is_published'  => 1,
                'settings_json' => json_encode($formData['settings'] ?? []),
            ]);

            if ($newFormId > 0 && !empty($formData['fields']) && is_array($formData['fields'])) {
                foreach ($formData['fields'] as $index => $field) {
                    Orm::forTable('form_fields')->insert([
                        'form_id'           => $newFormId,
                        'field_type'        => sanitize_text_field($field['field_type'] ?? 'short_answer'),
                        'field_label'       => sanitize_text_field($field['field_label'] ?? 'Question'),
                        'field_placeholder' => sanitize_text_field($field['field_placeholder'] ?? ''),
                        'is_required'       => !empty($field['is_required']) ? 1 : 0,
                        'display_order'     => $index + 1,
                        'options_json'      => json_encode($field['options'] ?? []),
                        'correct_answer'    => sanitize_text_field($field['correct_answer'] ?? ''),
                        'points'            => (int) ($field['points'] ?? 1),
                    ]);
                }
            }

            $importedCount++;
        }

        $result = ['imported_forms_count' => $importedCount];
        $builder = EnvelopeBuilder::createSuccess($result, HttpStatusType::Created->value, ResponseMessageType::Created->value);
        return new WP_REST_Response($builder->build(), HttpStatusType::Created->value);
    }

    public function getSqliteStatus(WP_REST_Request $request): WP_REST_Response {
        $status = SqliteDatabase::getInstance()->getTableCounts();
        $builder = EnvelopeBuilder::createSuccess($status, HttpStatusType::Ok->value, ResponseMessageType::Ok->value);
        return new WP_REST_Response($builder->build(), HttpStatusType::Ok->value);
    }
}
