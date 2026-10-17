<?php
/**
 * REST API Controller for video uploads to the WordPress media library.
 *
 * Task-08 (video as question content): authors attach MP4/WebM videos to
 * `video_prompt` questions. Uploaded blobs go to the WordPress media library
 * (the durable store — not the plugin's own tables), and the field keeps only
 * `{ attachmentId, url, posterUrl }`. Never a base64 blob in form JSON.
 *
 * Server-side constraints (AC-V2):
 * - `current_user_can('upload_files')` on the endpoint.
 * - MIME allowlist: video/mp4, video/webm — detected server-side with finfo,
 *   so a renamed .exe is rejected even if the client claims video/mp4.
 * - Size cap: 128 MB default, filterable via `wp_exam_video_max_upload_bytes`.
 *
 * @package WpExam\Api
 */

declare(strict_types=1);

namespace WpExam\Api;

if (!defined('ABSPATH')) {
    exit;
}

use WP_Error;
use WP_REST_Controller;
use WP_REST_Server;
use WP_REST_Request;
use WP_REST_Response;
use WpExam\Helpers\EnvelopeBuilder;
use WpExam\Enums\HttpStatusType;
use WpExam\Enums\ResponseMessageType;

class MediaUploadRestController extends WP_REST_Controller {
    protected string $namespace = 'wp-exam/v1';

    private const ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/webm'];

    private const DEFAULT_MAX_BYTES = 134217728; // 128 MB

    public function registerRoutes(): void {
        register_rest_route($this->namespace, '/media/video', [
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'uploadVideo'],
                'permission_callback' => [$this, 'checkUploadPermission'],
            ],
        ]);
    }

    public function checkUploadPermission(): bool {
        return current_user_can('upload_files');
    }

    public function uploadVideo(WP_REST_Request $request): WP_REST_Response {
        if (!isset($_FILES['file']) || !is_array($_FILES['file'])) {
            return $this->errorResponse('No video file was provided.', HttpStatusType::BadRequest->value);
        }

        $file = $_FILES['file'];
        $uploadError = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);

        if ($uploadError !== UPLOAD_ERR_OK) {
            return $this->errorResponse('The video upload did not complete.', HttpStatusType::BadRequest->value);
        }

        $maxBytes = (int) apply_filters('wp_exam_video_max_upload_bytes', self::DEFAULT_MAX_BYTES);

        if ($maxBytes <= 0) {
            $maxBytes = self::DEFAULT_MAX_BYTES;
        }

        $size = (int) ($file['size'] ?? 0);

        if ($size <= 0 || $size > $maxBytes) {
            return $this->errorResponse('Video exceeds the upload size limit.', HttpStatusType::BadRequest->value);
        }

        $tmpPath = (string) ($file['tmp_name'] ?? '');

        if ($tmpPath === '' || !is_uploaded_file($tmpPath)) {
            return $this->errorResponse('The uploaded file could not be verified.', HttpStatusType::BadRequest->value);
        }

        // Server-side MIME detection — the client's claimed type is not trusted.
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $detectedMime = $finfo !== false ? (string) finfo_file($finfo, $tmpPath) : '';

        if ($finfo !== false) {
            finfo_close($finfo);
        }

        $originalName = (string) ($file['name'] ?? 'video');
        $typeCheck = wp_check_filetype($originalName, ['mp4' => 'video/mp4', 'webm' => 'video/webm']);

        $isAllowedMime = in_array($detectedMime, self::ALLOWED_VIDEO_MIMES, true)
            && in_array((string) ($typeCheck['type'] ?? ''), self::ALLOWED_VIDEO_MIMES, true);

        if (!$isAllowedMime) {
            return $this->errorResponse('Only MP4 or WebM videos can be uploaded.', HttpStatusType::BadRequest->value);
        }

        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';

        $attachmentId = media_handle_upload('file', 0);

        if ($attachmentId instanceof WP_Error) {
            return $this->errorResponse('The video could not be stored in the media library.', HttpStatusType::InternalServerError->value);
        }

        $attachmentId = (int) $attachmentId;
        $url = (string) wp_get_attachment_url($attachmentId);

        if ($url === '') {
            return $this->errorResponse('The video was stored but its URL is unavailable.', HttpStatusType::InternalServerError->value);
        }

        $builder = EnvelopeBuilder::createSuccess(
            [
                'attachmentId' => $attachmentId,
                'url'          => $url,
                'posterUrl'    => '',
            ],
            HttpStatusType::Ok->value,
            ResponseMessageType::Ok->value,
        );

        return new WP_REST_Response($builder->build(), HttpStatusType::Ok->value);
    }

    private function errorResponse(string $message, int $status): WP_REST_Response {
        // Identical envelope shape for every failure — no information oracle.
        $builder = EnvelopeBuilder::createError($message, $status);

        return new WP_REST_Response($builder->build(), $status);
    }
}
