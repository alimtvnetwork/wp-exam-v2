<?php

class WP_Exam_Admin {
    public function init() {
        add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
    }

    public function add_admin_menu() {
        add_menu_page(
            'WP Exam',
            'WP Exam',
            'manage_options',
            'wp-exam',
            array( $this, 'render_admin_page' ),
            'dashicons-welcome-learn-more',
            25
        );
    }

    public function render_admin_page() {
        echo '<div id="wp-exam-app"></div>';
    }

    public function enqueue_scripts( $hook ) {
        if ( 'toplevel_page_wp-exam' !== $hook ) {
            return;
        }

        // We assume Vite will build to dist/assets/
        // For development, one would run a Vite dev server, but for simplicity here we assume a build
        $plugin_url = WP_EXAM_PLUGIN_URL;
        
        // Ensure you have run `npm run build` and it generated the correct files
        // This is a naive enqueue for a bundled React app
        
        $asset_manifest_path = WP_EXAM_PLUGIN_DIR . 'dist/.vite/manifest.json';
        if ( file_exists( $asset_manifest_path ) ) {
            $manifest = json_decode( file_get_contents( $asset_manifest_path ), true );
            if ( isset( $manifest['src/main.tsx'] ) ) {
                $js_file = $manifest['src/main.tsx']['file'];
                
                wp_enqueue_script(
                    'wp-exam-app',
                    $plugin_url . 'dist/' . $js_file,
                    array( 'wp-element' ),
                    WP_EXAM_VERSION,
                    true
                );
                
                if ( isset( $manifest['src/main.tsx']['css'] ) ) {
                    foreach ( $manifest['src/main.tsx']['css'] as $index => $css_file ) {
                        wp_enqueue_style(
                            'wp-exam-app-style-' . $index,
                            $plugin_url . 'dist/' . $css_file,
                            array(),
                            WP_EXAM_VERSION
                        );
                    }
                }
            }
        }

        wp_localize_script( 'wp-exam-app', 'wpExamSettings', array(
            'root'  => esc_url_raw( rest_url() ),
            'nonce' => wp_create_nonce( 'wp_rest' )
        ) );
    }
}
