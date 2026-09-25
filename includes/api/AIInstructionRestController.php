<?php
/**
 * REST Controller for AI Prompt & Schema Instructions Generator.
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
use WpExam\Http\EnvelopeBuilder;

class AIInstructionRestController extends WP_REST_Controller {
    protected string $namespace = 'wp-exam/v1';

    public function register_routes(): void {
        register_rest_route($this->namespace, '/ai/instructions', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'getAiInstructions'],
                'permission_callback' => '__return_true',
            ],
        ]);

        register_rest_route($this->namespace, '/ai/validate-json', [
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'validateProjectJson'],
                'permission_callback' => '__return_true',
            ],
        ]);
    }

    public function getAiInstructions(WP_REST_Request $request): WP_REST_Response {
        $sampleSchema = [
            'project_id'       => 'onboarding_security_101',
            'title'            => 'Security & Compliance Onboarding',
            'description'      => 'Essential security guidelines and step-by-step verification quizzes.',
            'category'         => 'Engineering',
            'pipeline_order'   => ['sec_reading', 'sec_checklist', 'sec_quiz'],
            'sections'         => [
                [
                    'id'               => 'sec_reading',
                    'title'            => 'Step 1: Security Policies',
                    'content_type'     => 'reading',
                    'reading_content'  => "## 1. Password Hygiene\nAlways use 16+ characters...\n## 2. 2FA Requirements\nAll employees must enable TOTP hardware tokens.",
                    'video_url'        => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                ],
                [
                    'id'               => 'sec_checklist',
                    'title'            => 'Step 2: Practical Verification',
                    'content_type'     => 'checklist',
                    'checklist'        => [
                        ['id' => 'chk_1', 'label' => 'Installed 1Password or Bitwarden on work computer', 'is_required' => true],
                        ['id' => 'chk_2', 'label' => 'Enrolled Google 2-Step Verification with FIDO Key', 'is_required' => true],
                        ['id' => 'chk_3', 'label' => 'Encrypted internal hard drive with FileVault/BitLocker', 'is_required' => true],
                    ],
                ],
                [
                    'id'               => 'sec_quiz',
                    'title'            => 'Step 3: Knowledge Check',
                    'content_type'     => 'quiz',
                    'settings'         => [
                        'theme'            => 'purple',
                        'time_limit_mins'  => 15,
                        'pass_percent'     => 80,
                        'hide_answers'     => true,
                    ],
                    'questions'        => [
                        [
                            'id'             => 'q1',
                            'type'           => 'mcq',
                            'title'          => 'What is the minimum recommended length for an enterprise password?',
                            'subtitle'       => 'Select one',
                            'options'        => ['6 characters', '8 characters', '12 characters', '16+ characters'],
                            'correct_answer' => '16+ characters',
                            'hint'           => 'Recall the NIST SP 800-63B guidelines discussed in Step 1.',
                            'points'         => 10,
                        ],
                        [
                            'id'             => 'q2',
                            'type'           => 'multiselect',
                            'title'          => 'Which communication channels are approved for sharing internal API keys?',
                            'subtitle'       => 'Select all that apply',
                            'options'        => ['Public Slack Channel', 'Internal HashiCorp Vault', 'Direct Message in Slack', 'Encrypted Secret Manager'],
                            'correct_answer' => ['Internal HashiCorp Vault', 'Encrypted Secret Manager'],
                            'hint'           => 'Never send raw secrets via unencrypted chat.',
                            'points'         => 15,
                        ],
                        [
                            'id'             => 'q3',
                            'type'           => 'url_submission',
                            'title'          => 'Submit your completed Security Compliance checklist confirmation link',
                            'subtitle'       => 'Must be a Google Docs or Notion URL',
                            'verification_type' => 'google_docs',
                            'points'         => 20,
                        ],
                    ],
                ],
            ],
        ];

        $systemPrompt = "You are an expert Instructional Designer and Exam Architect for WP Exam.\n" .
            "The user will provide training documents, employee onboarding notes, or a screenshot of an exam flow.\n" .
            "Your job is to transform their content into the strict JSON schema shown below.\n\n" .
            "RULES:\n" .
            "1. Produce VALID JSON only with no conversational text outside the json block.\n" .
            "2. For each question, supply 'id', 'type' ('mcq', 'multiselect', 'paragraph', 'url_submission', 'mindmap', 'file_upload'), 'title', 'subtitle', 'options', 'correct_answer', and 'hint'.\n" .
            "3. Use bold emphasis in titles for focus (e.g. 'What is the **primary** security standard?').\n" .
            "4. For multi-step onboarding, divide content logically into 'reading', 'checklist', and 'quiz' sections.\n";

        return new WP_REST_Response(EnvelopeBuilder::createSuccessEnvelope([
            'system_prompt'  => $systemPrompt,
            'json_schema'    => $sampleSchema,
            'sample_json'    => json_encode($sampleSchema, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES),
        ]), 200);
    }

    public function validateProjectJson(WP_REST_Request $request): WP_REST_Response {
        $params = $request->get_json_params();
        $hasParams = is_array($params);
        if (!$hasParams) {
            return new WP_REST_Response(EnvelopeBuilder::createErrorEnvelope('Invalid JSON payload'), 400);
        }

        $title = $params['title'] ?? '';
        $hasTitle = !empty($title);
        if (!$hasTitle) {
            return new WP_REST_Response(EnvelopeBuilder::createErrorEnvelope('Missing project "title"'), 422);
        }

        $sections = $params['sections'] ?? [];
        $hasSections = is_array($sections) && count($sections) > 0;
        if (!$hasSections) {
            return new WP_REST_Response(EnvelopeBuilder::createErrorEnvelope('Project must contain at least one section'), 422);
        }

        $totalQuestions = 0;
        foreach ($sections as $sec) {
            $questions = $sec['questions'] ?? [];
            if (is_array($questions)) {
                $totalQuestions += count($questions);
            }
        }

        return new WP_REST_Response(EnvelopeBuilder::createSuccessEnvelope([
            'is_valid'        => true,
            'title'           => $title,
            'section_count'   => count($sections),
            'question_count'  => $totalQuestions,
            'message'         => 'Project JSON structure validated successfully.',
        ]), 200);
    }
}
