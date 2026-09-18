<?php
/**
 * PHPUnit bootstrap for WP Exam.
 * Defines WordPress stubs so unit tests run cleanly without a full WordPress installation.
 */

if (!defined('ABSPATH')) {
    define('ABSPATH', sys_get_temp_dir() . '/wordpress/');
}

if (!defined('WP_PLUGIN_DIR')) {
    define('WP_PLUGIN_DIR', sys_get_temp_dir() . '/wp-plugins-test');
}

if (!function_exists('sanitize_text_field')) {
    function sanitize_text_field(string $str): string {
        return strip_tags(trim($str));
    }
}

if (!function_exists('sanitize_textarea_field')) {
    function sanitize_textarea_field(string $str): string {
        return strip_tags(trim($str));
    }
}

if (!function_exists('sanitize_email')) {
    function sanitize_email(string $email): string {
        return filter_var(trim($email), FILTER_SANITIZE_EMAIL) ?: '';
    }
}

if (!function_exists('wp_json_encode')) {
    function wp_json_encode(mixed $data, int $options = 0, int $depth = 512): string|false {
        return json_encode($data, $options, $depth);
    }
}

if (!function_exists('current_user_can')) {
    function current_user_can(string $capability): bool {
        return true;
    }
}

if (!function_exists('is_user_logged_in')) {
    function is_user_logged_in(): bool {
        return false;
    }
}

if (!function_exists('get_current_user_id')) {
    function get_current_user_id(): int {
        return 0;
    }
}

if (!function_exists('add_action')) {
    function add_action(string $hook, callable $callback, int $priority = 10, int $acceptedArgs = 1): true {
        return true;
    }
}

if (!function_exists('register_rest_route')) {
    function register_rest_route(string $namespace, string $route, array $args = [], bool $override = false): bool {
        return true;
    }
}

if (!class_exists('WP_REST_Server')) {
    class WP_REST_Server {
        public const READABLE = 'GET';
        public const CREATABLE = 'POST';
        public const EDITABLE = 'POST, PUT, PATCH';
        public const DELETABLE = 'DELETE';
    }
}

if (!class_exists('WP_REST_Request')) {
    class WP_REST_Request implements \ArrayAccess {
        private array $params = [];
        private array $headers = [];
        private string $method = 'GET';

        public function offsetExists(mixed $offset): bool { return isset($this->params[$offset]); }
        public function offsetGet(mixed $offset): mixed { return $this->params[$offset] ?? null; }
        public function offsetSet(mixed $offset, mixed $value): void { $this->params[$offset] = $value; }
        public function offsetUnset(mixed $offset): void { unset($this->params[$offset]); }

        public function set_param(string $key, mixed $value): void { $this->params[$key] = $value; }
        public function get_param(string $key): mixed { return $this->params[$key] ?? null; }
        public function get_method(): string { return $this->method; }
        public function set_method(string $method): void { $this->method = $method; }
    }
}

if (!class_exists('WP_REST_Response')) {
    class WP_REST_Response {
        public mixed $data;
        public int $status;
        public function __construct(mixed $data = null, int $status = 200) {
            $this->data = $data;
            $this->status = $status;
        }
        public function get_data(): mixed { return $this->data; }
        public function get_status(): int { return $this->status; }
    }
}

if (!class_exists('WP_Error')) {
    class WP_Error {
        private string $code;
        private string $message;
        private mixed $data;

        public function __construct(string $code = '', string $message = '', mixed $data = '') {
            $this->code = $code;
            $this->message = $message;
            $this->data = $data;
        }

        public function get_error_code(): string { return $this->code; }
        public function get_error_message(): string { return $this->message; }
        public function get_error_data(): mixed { return $this->data; }
    }
}

if (!class_exists('wpdb')) {
    class wpdb {
        public string $prefix = 'wp_';
        public string $last_error = '';
        public string $last_query = '';
        public int $insert_id = 0;

        public function suppress_errors(bool $suppress = true): bool { return true; }
        public function prepare(string $query, mixed ...$args): string {
            return vsprintf(str_replace('%d', '%d', str_replace('%s', "'%s'", $query)), $args);
        }
        public function get_row(string $query, string $output = 'OBJECT'): mixed { return null; }
        public function get_results(string $query, string $output = 'OBJECT'): array { return []; }
        public function insert(string $table, array $data): int|false { return 1; }
        public function update(string $table, array $data, array $where): int|false { return 1; }
        public function delete(string $table, array $where): int|false { return 1; }
        public function query(string $query): int|false { return 1; }
    }
}

// Global wpdb instance
$GLOBALS['wpdb'] = new wpdb();

// Load plugin autoloader
require_once dirname(__DIR__) . '/includes/Autoloader.php';
