<?php

declare(strict_types=1);

namespace App\Routing;

use App\Http\Controllers\Forms\FormController;
use App\Models\Forms\Form;
use App\Models\Forms\FormSection;
use App\Models\Forms\FormField;
use App\Models\Forms\FieldCondition;

class Route
{
    /** @var array<int, array{method: string, uri: string, regex: string, paramNames: array<int, string>, action: callable|array}> */
    private static array $routes = [];

    private static bool $isLoaded = false;

    public static function get(string $uri, callable|array $action): void
    {
        self::addRoute('GET', $uri, $action);
    }

    public static function post(string $uri, callable|array $action): void
    {
        self::addRoute('POST', $uri, $action);
    }

    public static function put(string $uri, callable|array $action): void
    {
        self::addRoute('PUT', $uri, $action);
    }

    public static function delete(string $uri, callable|array $action): void
    {
        self::addRoute('DELETE', $uri, $action);
    }

    public static function addRoute(string $method, string $uri, callable|array $action): void
    {
        $normalizedUri = '/' . trim($uri, '/');

        preg_match_all('/\{([a-zA-Z0-9_]+)\}/', $normalizedUri, $matches);
        $paramNames = $matches[1] ?? [];

        $regexPattern = preg_replace('/\{[a-zA-Z0-9_]+\}/', '([^/]+)', $normalizedUri);
        $regex = '#^' . $regexPattern . '$#';

        self::$routes[] = [
            'method' => strtoupper($method),
            'uri' => $normalizedUri,
            'regex' => $regex,
            'paramNames' => $paramNames,
            'action' => $action,
        ];
    }

    public static function loadRoutes(): void
    {
        if (self::$isLoaded) {
            return;
        }

        $apiRoutesFile = dirname(__DIR__, 2) . '/routes/api.php';

        if (file_exists($apiRoutesFile)) {
            require_once $apiRoutesFile;
        }

        self::$isLoaded = true;
    }

    public static function reset(): void
    {
        self::$routes = [];
        self::$isLoaded = false;
    }

    /**
     * @return array<int, array{method: string, uri: string}>
     */
    public static function getRoutes(): array
    {
        self::loadRoutes();

        return self::$routes;
    }

    /**
     * Dispatches a method + URI and returns [status, data]
     *
     * @param string $method
     * @param string $uri
     * @param array<string, mixed> $body
     * @param array<string, string> $headers
     * @return array{status: int, body: array<string, mixed>}
     */
    public static function dispatch(string $method, string $uri, array $body = [], array $headers = []): array
    {
        self::loadRoutes();

        $path = parse_url($uri, PHP_URL_PATH) ?? '/';
        $normalizedPath = '/' . trim($path, '/');
        $upperMethod = strtoupper($method);

        foreach (self::$routes as $route) {
            $isMethodMatch = ($route['method'] === $upperMethod);

            if ($isMethodMatch) {
                if (preg_match($route['regex'], $normalizedPath, $matches)) {
                    array_shift($matches);

                    $params = [];

                    foreach ($route['paramNames'] as $index => $name) {
                        $params[$name] = $matches[$index] ?? null;
                    }

                    return self::executeAction($route['action'], $params, $body, $headers);
                }
            }
        }

        return [
            'status' => 404,
            'body' => [
                'status' => 'error',
                'is_success' => false,
                'message' => "Route not found: {$upperMethod} {$normalizedPath}",
            ],
        ];
    }

    private static function executeAction(callable|array $action, array $routeParams, array $body, array $headers): array
    {
        if (is_array($action)) {
            [$class, $method] = $action;

            if ($class === FormController::class) {
                $controller = new FormController();
                $slug = (string) ($routeParams['slug'] ?? ($routeParams['token'] ?? ''));

                return self::dispatchFormController($controller, $method, $slug, $routeParams, $body, $headers);
            }

            $instance = new $class();
            $result = $instance->$method($routeParams, $body);

            return [
                'status' => 200,
                'body' => (array) $result,
            ];
        }

        $result = call_user_func($action, $routeParams, $body);

        return [
            'status' => 200,
            'body' => (array) $result,
        ];
    }

    private static function dispatchFormController(
        FormController $controller,
        string $method,
        string $slug,
        array $routeParams,
        array $body,
        array $headers
    ): array {
        $sampleForm = self::getSampleForm($slug ?: 'job-application');

        if ($method === 'show') {
            $data = $controller->show($sampleForm);
            $data['status'] = 'success';

            return ['status' => 200, 'body' => $data];
        }

        if ($method === 'validateField') {
            $fieldKey = (string) ($body['field_key'] ?? 'email');
            $value = $body['value'] ?? '';
            $field = self::findFieldInForm($sampleForm, $fieldKey);

            if ($field === null) {
                $isEmailField = ($fieldKey === 'email');
                $fieldType = $isEmailField ? 'email' : 'text';
                $field = new FormField([
                    'FieldKey' => $fieldKey,
                    'FieldType' => $fieldType,
                    'Label' => ucfirst(str_replace('_', ' ', $fieldKey)),
                    'IsRequired' => 1,
                ]);
            }

            $data = $controller->validateField($field, $value, $body);
            $isSuccess = ($data['is_success'] ?? false);
            $status = $isSuccess ? 200 : 422;
            $data['status'] = $isSuccess ? 'success' : 'error';

            return ['status' => $status, 'body' => $data];
        }

        if ($method === 'testWhatsApp') {
            $code = (string) ($body['phone_code'] ?? '+880');
            $num = (string) ($body['phone_number'] ?? '');
            $data = $controller->testWhatsApp($code, $num);
            $isSuccess = ($data['is_success'] ?? false);
            $status = $isSuccess ? 200 : 422;
            $data['status'] = $isSuccess ? 'success' : 'error';

            return ['status' => $status, 'body' => $data];
        }

        if ($method === 'countriesCache') {
            $ip = $headers['X-Forwarded-For'] ?? ($headers['x-forwarded-for'] ?? null);
            $data = $controller->countriesCache($ip);
            $data['status'] = 'success';

            return ['status' => 200, 'body' => $data];
        }

        if ($method === 'saveDraft') {
            $email = (string) ($body['email'] ?? ($body['state_data']['email'] ?? 'applicant@developers-organism.com'));
            $step = (int) ($body['step_index'] ?? 1);
            $stateData = (array) ($body['state_data'] ?? $body);
            $data = $controller->saveDraft(1, $email, $step, $stateData);
            $data['status'] = 'success';

            return ['status' => 200, 'body' => $data];
        }

        if ($method === 'resumeDraft') {
            $token = (string) ($routeParams['token'] ?? $slug);
            $data = $controller->resumeDraft($token);
            $isSuccess = ($data['is_success'] ?? false);
            $status = $isSuccess ? 200 : 404;
            $data['status'] = $isSuccess ? 'success' : 'error';

            return ['status' => $status, 'body' => $data];
        }

        if ($method === 'submit') {
            $data = $controller->submit($sampleForm, $body);
            $isSuccess = ($data['is_success'] ?? false);
            $status = $isSuccess ? 200 : 400;
            $data['status'] = $isSuccess ? 'success' : 'error';

            return ['status' => $status, 'body' => $data];
        }

        return [
            'status' => 404,
            'body' => [
                'status' => 'error',
                'is_success' => false,
                'message' => 'Action not found',
            ],
        ];
    }

    private static function getSampleForm(string $slug): Form
    {
        $form = new Form([
            'FormId' => 1,
            'Slug' => $slug,
            'Title' => 'Job Application Form',
            'ThemeId' => 'riseup-asia',
            'IsActive' => 1,
            'HasDraftMode' => 1,
            'HasCaptcha' => 1,
        ]);

        $section1 = new FormSection([
            'FormSectionId' => 1,
            'StepOrder' => 1,
            'Title' => 'Personal Information',
            'IsVisible' => 1,
        ]);

        $fieldFullName = new FormField([
            'FieldKey' => 'full_name',
            'FieldType' => 'text',
            'Label' => 'Full Name',
            'IsRequired' => 1,
        ]);

        $fieldEmail = new FormField([
            'FieldKey' => 'email',
            'FieldType' => 'email',
            'Label' => 'Email Address',
            'IsRequired' => 1,
        ]);

        $fieldHasExp = new FormField([
            'FieldKey' => 'has_experience',
            'FieldType' => 'radio',
            'Label' => 'Do you have work experience?',
            'IsRequired' => 0,
        ]);

        $fieldYears = new FormField([
            'FieldKey' => 'years_of_experience',
            'FieldType' => 'number',
            'Label' => 'Years of Experience',
            'IsRequired' => 0,
        ]);

        $condYears = new FieldCondition([
            'ParentFieldKey' => 'has_experience',
            'Operator' => 'equals',
            'ExpectedValue' => '1',
            'TargetType' => 'field',
            'Action' => 'require',
            'IsActive' => 1,
        ]);
        $fieldYears->addCondition($condYears);

        $section1->addField($fieldFullName);
        $section1->addField($fieldEmail);
        $section1->addField($fieldHasExp);
        $section1->addField($fieldYears);

        $form->addSection($section1);

        return $form;
    }

    private static function findFieldInForm(Form $form, string $fieldKey): ?FormField
    {
        foreach ($form->getSections() as $section) {
            foreach ($section->getFields() as $field) {
                $isMatch = ($field->getFieldKey() === $fieldKey);

                if ($isMatch) {
                    return $field;
                }
            }
        }

        return null;
    }
}
