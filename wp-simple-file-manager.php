<?php
/*
Plugin Name: WP Simple File Manager
Plugin URI: 
Description: A simple file manager for WordPress.
Version: 1.0
Author:  Aditya Kumar
Author URI: https://trancedtales.com
License: GPL2
*/

// Enqueue scripts and styles
function sfm_enqueue_scripts() {
    wp_enqueue_script('sfm-file-manager', plugin_dir_url(__FILE__) . 'file-manager.js', array('jquery'), '1.0', true);
    wp_enqueue_style('sfm-file-manager', plugin_dir_url(__FILE__) . 'style.css');
}

add_action('admin_enqueue_scripts', 'sfm_enqueue_scripts');

// Add menu page
function sfm_create_menu() {
    add_menu_page(
        'File Manager',           // Page title
        'File Manager',           // Menu title
        'manage_options',         // Capability
        'sfm-file-manager',       // Menu slug
        'sfm_file_manager_page',  // Callback function
        'dashicons-media-default',// Icon
        6                         // Position
    );
}

add_action('admin_menu', 'sfm_create_menu');

// File Manager Page
function sfm_file_manager_page() {
    ?>
    <div class="wrap">
        <h1>Simple File Manager</h1>
        <input type="file" id="file-upload" />
        <button id="upload-file">Upload File</button>
        
        <!-- Add search input -->
        <input type="text" id="file-search" placeholder="Search files..." style="margin-top: 20px;" />
        
        <div id="file-list"></div>
    </div>
    <?php
}

// Handle file uploads
function sfm_handle_file_upload() {
    check_ajax_referer('sfm_upload_nonce', 'security');

    $uploaded_file = $_FILES['file'];
    $upload_dir = wp_upload_dir();
    $target_path = $upload_dir['path'] . '/' . basename($uploaded_file['name']);

    if (move_uploaded_file($uploaded_file['tmp_name'], $target_path)) {
        wp_send_json_success(array('file_url' => $upload_dir['url'] . '/' . basename($uploaded_file['name'])));
    } else {
        wp_send_json_error('Error uploading file.');
    }
}

add_action('wp_ajax_sfm_upload_file', 'sfm_handle_file_upload');

// Handle file deletion
function sfm_handle_file_delete() {
    check_ajax_referer('sfm_upload_nonce', 'security');

    $file_path = $_POST['file_path'];
    $upload_dir = wp_upload_dir();
    $target_path = str_replace($upload_dir['baseurl'], $upload_dir['basedir'], $file_path);

    if (unlink($target_path)) {
        wp_send_json_success('File deleted successfully.');
    } else {
        wp_send_json_error('Error deleting file.');
    }
}

add_action('wp_ajax_sfm_delete_file', 'sfm_handle_file_delete');

// Add nonce for security
function sfm_add_upload_nonce() {
    $nonce = wp_create_nonce('sfm_upload_nonce');
    echo "<script>var sfm_upload_nonce = '{$nonce}';</script>";
}
add_action('admin_footer', 'sfm_add_upload_nonce');
