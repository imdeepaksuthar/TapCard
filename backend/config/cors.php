<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to configure this as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Local dev origins are always allowed; production origins come from env
    // (CORS_ALLOWED_ORIGINS, comma-separated) so the deployed domain is never
    // hardcoded. Falls back to FRONTEND_URL if CORS_ALLOWED_ORIGINS is unset.
    'allowed_origins' => array_values(array_filter(array_merge(
        [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3001',
        ],
        array_map('trim', array_filter(explode(',', (string) env('CORS_ALLOWED_ORIGINS', (string) env('FRONTEND_URL', '')))))
    ))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
