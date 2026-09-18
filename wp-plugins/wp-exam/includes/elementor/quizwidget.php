<?php
/**
 * WP Exam Elementor Widget.
 *
 * Provides visual Elementor drag-and-drop embedding for quizzes and exam runners.
 *
 * @package WpExam\Elementor
 */

namespace WpExam\Elementor;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * QuizWidget class for Elementor visual page builder.
 */
class QuizWidget {
    public function getName(): string {
        return 'wp_exam_quiz';
    }

    public function getTitle(): string {
        return 'WP Exam & Quiz Runner';
    }

    public function getIcon(): string {
        return 'eicon-form-horizontal';
    }

    public function getCategories(): array {
        return ['general', 'basic'];
    }

    public function renderWidget(array $settings = []): string {
        $projectId = !empty($settings['project_id']) ? esc_attr($settings['project_id']) : 'letterly-sample';
        $theme = !empty($settings['theme']) ? esc_attr($settings['theme']) : 'letterly';
        $hasCustomClass = !empty($settings['custom_class']);
        $customClass = $hasCustomClass ? esc_attr($settings['custom_class']) : '';

        $output = sprintf(
            '<div class="wp-exam-elementor-embed %s" data-project-id="%s" data-theme="%s" style="min-height: 400px; width: 100%%;">' .
            '  <div id="wp-exam-root" data-embedded="true" data-project="%s" data-theme="%s"></div>' .
            '</div>',
            $customClass,
            $projectId,
            $theme,
            $projectId,
            $theme
        );

        return $output;
    }

    public function render(): void {
        echo $this->renderWidget();
    }
}
