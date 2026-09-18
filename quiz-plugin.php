<?php
/**
 * Plugin Name: Quiz Plugin
 * Description: A basic quiz implementation with REST endpoints.
 * Version: 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Register REST routes.
 */
function qp_register_routes() {
    register_rest_route( 'qp/v1', '/quiz', array(
        'methods'  => 'GET',
        'callback' => 'qp_get_quiz',
        'permission_callback' => '__return_true',
    ) );
}
add_action( 'rest_api_init', 'qp_register_routes' );

/**
 * Handle GET request for quiz.
 *
 * @param WP_REST_Request $request
 * @return WP_REST_Response
 */
function qp_get_quiz( $request ) {
    $data = array(
        'title' => 'Sample Quiz',
        'questions' => array(),
    );
    return new WP_REST_Response( $data, 200 );
}
