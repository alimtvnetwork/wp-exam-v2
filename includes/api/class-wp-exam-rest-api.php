<?php

class WP_Exam_REST_API {
    public function init() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        register_rest_route( 'wp-exam/v1', '/quizzes', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_quizzes' ),
                'permission_callback' => array( $this, 'check_permission' )
            ),
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array( $this, 'create_quiz' ),
                'permission_callback' => array( $this, 'check_permission' )
            )
        ) );
        
        register_rest_route( 'wp-exam/v1', '/quizzes/(?P<id>\d+)', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_quiz' ),
                'permission_callback' => array( $this, 'check_permission' )
            ),
            array(
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => array( $this, 'update_quiz' ),
                'permission_callback' => array( $this, 'check_permission' )
            ),
            array(
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => array( $this, 'delete_quiz' ),
                'permission_callback' => array( $this, 'check_permission' )
            )
        ) );
    }

    public function check_permission() {
        return current_user_can( 'manage_options' );
    }

    public function get_quizzes( $request ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'wp_exam_quizzes';
        $results = $wpdb->get_results( "SELECT * FROM $table_name ORDER BY created_at DESC", ARRAY_A );
        
        foreach ( $results as &$row ) {
            $row['questions'] = json_decode( $row['questions'], true );
        }
        
        return rest_ensure_response( $results );
    }

    public function create_quiz( $request ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'wp_exam_quizzes';
        
        $data = array(
            'title'       => sanitize_text_field( $request->get_param( 'title' ) ),
            'description' => sanitize_textarea_field( $request->get_param( 'description' ) ),
            'questions'   => wp_json_encode( $request->get_param( 'questions' ) ?: array() )
        );
        
        $wpdb->insert( $table_name, $data );
        $data['id'] = $wpdb->insert_id;
        $data['questions'] = json_decode( $data['questions'], true );
        
        return rest_ensure_response( $data );
    }
    
    public function get_quiz( $request ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'wp_exam_quizzes';
        $id = intval( $request['id'] );
        
        $row = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_name WHERE id = %d", $id ), ARRAY_A );
        if ( ! $row ) {
            return new WP_Error( 'not_found', 'Quiz not found', array( 'status' => 404 ) );
        }
        
        $row['questions'] = json_decode( $row['questions'], true );
        return rest_ensure_response( $row );
    }

    public function update_quiz( $request ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'wp_exam_quizzes';
        $id = intval( $request['id'] );
        
        $data = array(
            'title'       => sanitize_text_field( $request->get_param( 'title' ) ),
            'description' => sanitize_textarea_field( $request->get_param( 'description' ) ),
            'questions'   => wp_json_encode( $request->get_param( 'questions' ) ?: array() )
        );
        
        $wpdb->update( $table_name, $data, array( 'id' => $id ) );
        $data['id'] = $id;
        $data['questions'] = json_decode( $data['questions'], true );
        
        return rest_ensure_response( $data );
    }

    public function delete_quiz( $request ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'wp_exam_quizzes';
        $id = intval( $request['id'] );
        
        $wpdb->delete( $table_name, array( 'id' => $id ) );
        return rest_ensure_response( array( 'deleted' => true ) );
    }
}
