<?php
/**
 * REST API Controller for Forms, Quizzes, and Submissions.
 *
 * @package WpExam\Api
 */

namespace WpExam\Api;

if (!defined('ABSPATH')) {
    exit;
}

use WP_REST_Controller;
use WP_REST_Server;
use WP_REST_Request;
use WP_REST_Response;
use WpExam\Database\WpDbQueryWrapper;
use WpExam\Database\Orm;
use WpExam\Logging\FileLogger;
use WpExam\Helpers\EnvelopeBuilder;
use WpExam\Enums\HttpStatusType;
use WpExam\Enums\ResponseMessageType;
use Throwable;

class FormRestController extends WP_REST_Controller {
    protected string $namespace = 'wp-exam/v1';

    public function registerRoutes(): void {
        // Public / Respondent Endpoints
        register_rest_route($this->namespace, '/forms', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'getPublicForms'],
                'permission_callback' => '__return_true',
            ],
        ]);

        register_rest_route($this->namespace, '/forms/(?P<id>\d+)', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'getPublicForm'],
                'permission_callback' => '__return_true',
            ],
        ]);

        register_rest_route($this->namespace, '/forms/(?P<id>\d+)/submit', [
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'submitFormResponse'],
                'permission_callback' => '__return_true',
            ],
        ]);

        // Admin Management Endpoints
        register_rest_route($this->namespace, '/admin/forms', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'getAdminForms'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'createForm'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
        ]);

        register_rest_route($this->namespace, '/admin/forms/(?P<id>\d+)', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'getAdminForm'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
            [
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => [$this, 'updateForm'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
            [
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => [$this, 'deleteForm'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
        ]);

        register_rest_route($this->namespace, '/admin/forms/(?P<id>\d+)/submissions', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'getFormSubmissions'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
        ]);

        // Legacy compatibility routes
        register_rest_route($this->namespace, '/quizzes', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'getAdminForms'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'createForm'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
        ]);

        register_rest_route($this->namespace, '/quizzes/(?P<id>\d+)', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'getAdminForm'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
            [
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => [$this, 'updateForm'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
            [
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => [$this, 'deleteForm'],
                'permission_callback' => [$this, 'checkAdminPermission'],
            ],
        ]);
    }

    public function checkAdminPermission(): bool {
        $isAuthorized = current_user_can('manage_options');

        return $isAuthorized;
    }

    public function getPublicForms(WP_REST_Request $request): WP_REST_Response {
        global $wpdb;
        $tableForms = $wpdb->prefix . 'wp_exam_forms';

        $rows = WpDbQueryWrapper::execute($wpdb, function($db) use ($tableForms) {
            return $db->get_results("SELECT id, title, description, form_type, is_sequential FROM $tableForms WHERE is_published = 1 ORDER BY id DESC", ARRAY_A);
        });

        $forms = ($rows !== false) ? $rows : [];

        return EnvelopeBuilder::createSuccess($forms, HttpStatusType::Ok->value, ResponseMessageType::Ok->value)->toRestResponse();
    }

    public function getPublicForm(WP_REST_Request $request): WP_REST_Response {
        global $wpdb;
        $formId = (int) $request['id'];
        $tableForms = $wpdb->prefix . 'wp_exam_forms';
        $tableFields = $wpdb->prefix . 'wp_exam_fields';

        $form = WpDbQueryWrapper::execute($wpdb, function($db) use ($tableForms, $formId) {
            return $db->get_row($db->prepare("SELECT * FROM $tableForms WHERE id = %d AND is_published = 1", $formId), ARRAY_A);
        });

        $isNotFound = ($form === null || $form === false);

        if ($isNotFound) {
            return EnvelopeBuilder::createNotFound('Form not found or unpublished')->toRestResponse();
        }

        $fields = WpDbQueryWrapper::execute($wpdb, function($db) use ($tableFields, $formId) {
            return $db->get_results($db->prepare("SELECT id, form_id, field_type, field_label, field_placeholder, is_required, display_order, options_json, points FROM $tableFields WHERE form_id = %d ORDER BY display_order ASC, id ASC", $formId), ARRAY_A);
        });

        $decodedFields = [];

        if (is_array($fields)) {
            foreach ($fields as $field) {
                $field['options'] = !empty($field['options_json']) ? json_decode($field['options_json'], true) : [];
                unset($field['options_json']);
                $decodedFields[] = $field;
            }
        }

        $form['settings'] = !empty($form['settings_json']) ? json_decode($form['settings_json'], true) : [];
        $form['fields'] = $decodedFields;
        unset($form['settings_json']);

        return EnvelopeBuilder::createSuccess($form, HttpStatusType::Ok->value, ResponseMessageType::Ok->value)->toRestResponse();
    }

    public function getAdminForms(WP_REST_Request $request): WP_REST_Response {
        global $wpdb;
        $tableForms = $wpdb->prefix . 'wp_exam_forms';
        $tableFields = $wpdb->prefix . 'wp_exam_fields';
        $tableSubmissions = $wpdb->prefix . 'wp_exam_submissions';

        $rows = WpDbQueryWrapper::execute($wpdb, function($db) use ($tableForms, $tableFields, $tableSubmissions) {
            $sql = "SELECT f.*, 
                    (SELECT COUNT(*) FROM $tableFields WHERE form_id = f.id) as field_count,
                    (SELECT COUNT(*) FROM $tableSubmissions WHERE form_id = f.id) as submission_count
                    FROM $tableForms f ORDER BY f.id DESC";

            return $db->get_results($sql, ARRAY_A);
        });

        $forms = ($rows !== false) ? $rows : [];

        foreach ($forms as &$form) {
            $form['settings'] = !empty($form['settings_json']) ? json_decode($form['settings_json'], true) : [];
            unset($form['settings_json']);
        }

        return EnvelopeBuilder::createSuccess($forms, HttpStatusType::Ok->value, ResponseMessageType::Ok->value)->toRestResponse();
    }

    public function getAdminForm(WP_REST_Request $request): WP_REST_Response {
        global $wpdb;
        $formId = (int) $request['id'];
        $tableForms = $wpdb->prefix . 'wp_exam_forms';
        $tableFields = $wpdb->prefix . 'wp_exam_fields';

        $form = WpDbQueryWrapper::execute($wpdb, function($db) use ($tableForms, $formId) {
            return $db->get_row($db->prepare("SELECT * FROM $tableForms WHERE id = %d", $formId), ARRAY_A);
        });

        $isNotFound = ($form === null || $form === false);

        if ($isNotFound) {
            return EnvelopeBuilder::createNotFound('Form not found')->toRestResponse();
        }

        $fields = WpDbQueryWrapper::execute($wpdb, function($db) use ($tableFields, $formId) {
            return $db->get_results($db->prepare("SELECT * FROM $tableFields WHERE form_id = %d ORDER BY display_order ASC, id ASC", $formId), ARRAY_A);
        });

        $decodedFields = [];

        if (is_array($fields)) {
            foreach ($fields as $field) {
                $field['options'] = !empty($field['options_json']) ? json_decode($field['options_json'], true) : [];
                unset($field['options_json']);
                $decodedFields[] = $field;
            }
        }

        $form['settings'] = !empty($form['settings_json']) ? json_decode($form['settings_json'], true) : [];
        $form['fields'] = $decodedFields;
        unset($form['settings_json']);

        return EnvelopeBuilder::createSuccess($form, HttpStatusType::Ok->value, ResponseMessageType::Ok->value)->toRestResponse();
    }

    public function createForm(WP_REST_Request $request): WP_REST_Response {
        global $wpdb;
        $tableForms = $wpdb->prefix . 'wp_exam_forms';
        $tableFields = $wpdb->prefix . 'wp_exam_fields';

        $title = sanitize_text_field($request->get_param('title') ?: $request->get_param('Title') ?: 'Untitled Form');
        $description = sanitize_textarea_field($request->get_param('description') ?: $request->get_param('Description') ?: '');
        $formType = sanitize_text_field($request->get_param('form_type') ?: $request->get_param('FormType') ?: 'quiz');
        $formAccess = sanitize_text_field($request->get_param('form_access') ?: $request->get_param('FormAccess') ?: 'public');
        $isSequential = $request->get_param('is_sequential') ? 1 : 0;
        $isPublished = ($request->get_param('is_published') !== null) ? ($request->get_param('is_published') ? 1 : 0) : 1;

        $settings = $request->get_param('settings') ?: $request->get_param('Settings') ?: [];
        $settingsJson = wp_json_encode($settings);

        $formData = [
            'title'         => $title,
            'description'   => $description,
            'form_type'     => $formType,
            'form_access'   => $formAccess,
            'is_sequential' => $isSequential,
            'is_published'  => $isPublished,
            'settings_json' => $settingsJson,
        ];

        $insertResult = WpDbQueryWrapper::execute($wpdb, function($db) use ($tableForms, $formData) {
            $inserted = $db->insert($tableForms, $formData);

            return ($inserted !== false) ? (int) $db->insert_id : false;
        });

        $isInsertFail = ($insertResult === false);

        if ($isInsertFail) {
            return EnvelopeBuilder::createError('Failed to create form', HttpStatusType::InternalServerError->value)->toRestResponse();
        }

        $newFormId = $insertResult;
        $fields = $request->get_param('fields') ?: $request->get_param('Fields') ?: $request->get_param('questions') ?: [];

        if (is_array($fields)) {
            foreach ($fields as $index => $field) {
                $this->insertField($newFormId, $field, $index);
            }
        }

        $responseData = [
            'id'            => $newFormId,
            'title'         => $title,
            'form_type'     => $formType,
            'is_sequential' => (bool) $isSequential,
        ];

        return EnvelopeBuilder::createSuccess($responseData, HttpStatusType::Created->value, ResponseMessageType::Created->value)->toRestResponse();
    }

    public function updateForm(WP_REST_Request $request): WP_REST_Response {
        global $wpdb;
        $formId = (int) $request['id'];
        $tableForms = $wpdb->prefix . 'wp_exam_forms';
        $tableFields = $wpdb->prefix . 'wp_exam_fields';

        $title = sanitize_text_field($request->get_param('title') ?: $request->get_param('Title') ?: '');
        $description = sanitize_textarea_field($request->get_param('description') ?: $request->get_param('Description') ?: '');
        $formType = sanitize_text_field($request->get_param('form_type') ?: $request->get_param('FormType') ?: 'quiz');
        $formAccess = sanitize_text_field($request->get_param('form_access') ?: $request->get_param('FormAccess') ?: 'public');
        $isSequential = $request->get_param('is_sequential') ? 1 : 0;
        $isPublished = ($request->get_param('is_published') !== null) ? ($request->get_param('is_published') ? 1 : 0) : 1;

        $settings = $request->get_param('settings') ?: $request->get_param('Settings') ?: [];
        $settingsJson = wp_json_encode($settings);

        $updateData = [
            'title'         => $title,
            'description'   => $description,
            'form_type'     => $formType,
            'form_access'   => $formAccess,
            'is_sequential' => $isSequential,
            'is_published'  => $isPublished,
            'settings_json' => $settingsJson,
        ];

        WpDbQueryWrapper::execute($wpdb, function($db) use ($tableForms, $updateData, $formId) {
            return $db->update($tableForms, $updateData, ['id' => $formId]);
        });

        $fields = $request->get_param('fields') ?: $request->get_param('Fields') ?: $request->get_param('questions');

        if (is_array($fields)) {
            WpDbQueryWrapper::execute($wpdb, function($db) use ($tableFields, $formId) {
                return $db->delete($tableFields, ['form_id' => $formId]);
            });

            foreach ($fields as $index => $field) {
                $this->insertField($formId, $field, $index);
            }
        }

        $responseData = ['id' => $formId, 'title' => $title];

        return EnvelopeBuilder::createSuccess($responseData, HttpStatusType::Ok->value, ResponseMessageType::Updated->value)->toRestResponse();
    }

    public function deleteForm(WP_REST_Request $request): WP_REST_Response {
        global $wpdb;
        $formId = (int) $request['id'];
        $tableForms = $wpdb->prefix . 'wp_exam_forms';
        $tableFields = $wpdb->prefix . 'wp_exam_fields';

        WpDbQueryWrapper::execute($wpdb, function($db) use ($tableFields, $formId) {
            return $db->delete($tableFields, ['form_id' => $formId]);
        });

        $deleted = WpDbQueryWrapper::execute($wpdb, function($db) use ($tableForms, $formId) {
            return $db->delete($tableForms, ['id' => $formId]);
        });

        $isDeleteFail = ($deleted === false);

        if ($isDeleteFail) {
            return EnvelopeBuilder::createError('Failed to delete form', HttpStatusType::InternalServerError->value)->toRestResponse();
        }

        return EnvelopeBuilder::createSuccess(['id' => $formId], HttpStatusType::Ok->value, ResponseMessageType::Deleted->value)->toRestResponse();
    }

    public function submitFormResponse(WP_REST_Request $request): WP_REST_Response {
        global $wpdb;
        $formId = (int) $request['id'];
        $tableForms = $wpdb->prefix . 'wp_exam_forms';
        $tableFields = $wpdb->prefix . 'wp_exam_fields';
        $tableSubmissions = $wpdb->prefix . 'wp_exam_submissions';

        $form = WpDbQueryWrapper::execute($wpdb, function($db) use ($tableForms, $formId) {
            return $db->get_row($db->prepare("SELECT * FROM $tableForms WHERE id = %d", $formId), ARRAY_A);
        });

        $isNotFound = ($form === null || $form === false);

        if ($isNotFound) {
            return EnvelopeBuilder::createNotFound('Form not found')->toRestResponse();
        }

        $answers = $request->get_param('answers') ?: $request->get_param('Answers') ?: [];
        $guestEmail = sanitize_email($request->get_param('guest_email') ?: $request->get_param('GuestEmail') ?: '');
        $guestName = sanitize_text_field($request->get_param('guest_name') ?: $request->get_param('GuestName') ?: '');
        $userId = is_user_logged_in() ? get_current_user_id() : null;
        $userIp = sanitize_text_field($_SERVER['REMOTE_ADDR'] ?? '');

        $fields = WpDbQueryWrapper::execute($wpdb, function($db) use ($tableFields, $formId) {
            return $db->get_results($db->prepare("SELECT * FROM $tableFields WHERE form_id = %d", $formId), ARRAY_A);
        });

        $fieldsList = ($fields !== false) ? $fields : [];

        $isQuiz = ($form['form_type'] === 'quiz');
        $earnedScore = 0;
        $totalPossible = 0;

        if ($isQuiz) {
            foreach ($fieldsList as $f) {
                $fId = (string) $f['id'];
                $pts = (int) ($f['points'] ?: 1);
                $totalPossible += $pts;

                $userAnswer = $answers[$fId] ?? null;
                $correctAnswer = $f['correct_answer'] ?? '';

                $isMatch = (trim(strtolower((string) $userAnswer)) === trim(strtolower((string) $correctAnswer)));

                if ($isMatch) {
                    $earnedScore += $pts;
                }
            }
        }

        $settings = !empty($form['settings_json']) ? json_decode($form['settings_json'], true) : [];
        $passingPct = (int) ($settings['passingScore'] ?? 70);
        $scorePct = ($totalPossible > 0) ? round(($earnedScore / $totalPossible) * 100, 1) : 0;
        $isPassed = $isQuiz ? ($scorePct >= $passingPct) : null;

        $submissionData = [
            'form_id'              => $formId,
            'user_id'              => $userId,
            'guest_email'          => $guestEmail,
            'guest_name'           => $guestName,
            'user_ip'              => $userIp,
            'answers_json'         => wp_json_encode($answers),
            'score'                => $isQuiz ? $earnedScore : null,
            'total_possible_score' => $isQuiz ? $totalPossible : null,
            'is_passed'            => $isQuiz ? ($isPassed ? 1 : 0) : null,
        ];

        $subId = WpDbQueryWrapper::execute($wpdb, function($db) use ($tableSubmissions, $submissionData) {
            $inserted = $db->insert($tableSubmissions, $submissionData);

            return ($inserted !== false) ? (int) $db->insert_id : false;
        });

        // Synchronize to SQLite micro-ORM storage if available
        try {
            $sqliteSubId = Orm::forTable('form_submissions')->insert([
                'form_id'              => $formId,
                'user_id'              => (int) ($userId ?: 0),
                'guest_name'           => $guestName,
                'guest_email'          => $guestEmail,
                'form_type'            => $form['form_type'],
                'score'                => $isQuiz ? $earnedScore : 0,
                'total_possible_score' => $isQuiz ? $totalPossible : 0,
                'score_percentage'     => $isQuiz ? $scorePct : 0,
                'is_passed'            => $isQuiz ? ($isPassed ? 1 : 0) : 1,
            ]);

            $hasValidSqliteId = ($sqliteSubId > 0);

            if ($hasValidSqliteId) {
                $hasAnswersArray = is_array($answers);

                if ($hasAnswersArray) {
                    foreach ($fieldsList as $fld) {
                        $fId = (string) $fld['id'];
                        $userAns = (string) ($answers[$fId] ?? '');
                        $expectedAns = (string) ($fld['correct_answer'] ?? '');
                        $isCorrectAns = ($isQuiz && trim(strtolower($userAns)) === trim(strtolower($expectedAns)));

                        Orm::forTable('form_answers')->insert([
                            'submission_id' => $sqliteSubId,
                            'field_id'      => (int) $fld['id'],
                            'answer_value'  => $userAns,
                            'is_correct'    => $isCorrectAns ? 1 : 0,
                            'points_earned' => $isCorrectAns ? (float) ($fld['points'] ?? 1) : 0,
                        ]);
                    }
                }
            }

            $inviteToken = sanitize_text_field((string) ($request->get_param('invite_token') ?: ''));
            $hasInviteToken = !empty($inviteToken);

            if ($hasInviteToken) {
                $inviteRecord = Orm::forTable('user_invites')->where('invite_token', $inviteToken)->findOne();
                $hasInviteRecord = ($inviteRecord !== null);

                if ($hasInviteRecord) {
                    Orm::forTable('user_invites')->update((int) $inviteRecord['id'], ['status' => 'completed']);
                }
            }
        } catch (Throwable $e) {
            FileLogger::getInstance()->warning('SQLite submission synchronization notice: ' . $e->getMessage());
        }

        $resultPayload = [
            'submission_id'        => $subId,
            'form_id'              => $formId,
            'form_type'            => $form['form_type'],
            'score'                => $isQuiz ? $earnedScore : null,
            'total_possible_score' => $isQuiz ? $totalPossible : null,
            'score_percentage'     => $isQuiz ? $scorePct : null,
            'is_passed'            => $isPassed,
            'message'              => $settings['successMessage'] ?? ResponseMessageType::SubmissionRecorded->value,
        ];

        return EnvelopeBuilder::createSuccess($resultPayload, HttpStatusType::Ok->value, ResponseMessageType::SubmissionRecorded->value)->toRestResponse();
    }

    public function getFormSubmissions(WP_REST_Request $request): WP_REST_Response {
        global $wpdb;
        $formId = (int) $request['id'];
        $tableSubmissions = $wpdb->prefix . 'wp_exam_submissions';

        $rows = WpDbQueryWrapper::execute($wpdb, function($db) use ($tableSubmissions, $formId) {
            return $db->get_results($db->prepare("SELECT * FROM $tableSubmissions WHERE form_id = %d ORDER BY id DESC", $formId), ARRAY_A);
        });

        $submissions = ($rows !== false) ? $rows : [];

        foreach ($submissions as &$sub) {
            $sub['answers'] = !empty($sub['answers_json']) ? json_decode($sub['answers_json'], true) : [];
            unset($sub['answers_json']);
        }

        return EnvelopeBuilder::createSuccess($submissions, HttpStatusType::Ok->value, ResponseMessageType::Ok->value)->toRestResponse();
    }

    private function insertField(int $formId, array $field, int $order): void {
        global $wpdb;
        $tableFields = $wpdb->prefix . 'wp_exam_fields';

        $fieldLabel = sanitize_text_field($field['field_label'] ?? $field['text'] ?? 'Field');
        $fieldType = sanitize_text_field($field['field_type'] ?? $field['type'] ?? 'short_answer');
        $placeholder = sanitize_text_field($field['field_placeholder'] ?? $field['placeholder'] ?? '');
        $isRequired = !empty($field['is_required']) ? 1 : 0;
        $points = (int) ($field['points'] ?? 1);
        $correctAnswer = sanitize_text_field($field['correct_answer'] ?? $field['correctAnswer'] ?? '');

        $options = $field['options'] ?? [];
        $optionsJson = !empty($options) ? wp_json_encode($options) : null;

        $fieldData = [
            'form_id'           => $formId,
            'field_type'        => $fieldType,
            'field_label'       => $fieldLabel,
            'field_placeholder' => $placeholder,
            'is_required'       => $isRequired,
            'display_order'     => $order,
            'options_json'      => $optionsJson,
            'points'            => $points,
            'correct_answer'    => $correctAnswer,
        ];

        WpDbQueryWrapper::execute($wpdb, function($db) use ($tableFields, $fieldData) {
            return $db->insert($tableFields, $fieldData);
        });
    }
}
