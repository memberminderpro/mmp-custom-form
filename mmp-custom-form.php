<?php
/**
 * Plugin Name: MMP Custom Form
 * Description: A custom HTML form with multi-vendor captcha integration support
 * Version: 1.2
 * Author: Member Minder Pro, LLC
 */

// Create a settings page for the plugin
require_once plugin_dir_path(__FILE__) . 'inc/admin-page.php';

// Create shortcode for rendering the form
function mmp_custom_form_script_shortcode() {
    // Enqueue external libraries
    wp_enqueue_style('mmp-custom-form-font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.3.0/css/fontawesome.min.css');
    wp_enqueue_style('mmp-custom-form-select2-css', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css');
    wp_enqueue_script('jquery');
    wp_enqueue_script('mmp-custom-form-select2-js', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js', array('jquery'), null, true);
    wp_enqueue_script('mmp-custom-form-jquery-validate', 'https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.1/jquery.validate.min.js', array('jquery'), null, true);
    
    // Enqueue the CSS specific to this form
    wp_enqueue_style('mmp-form-style', plugin_dir_url(__FILE__) . 'templates/custom/ragas.online/join-us/css/mmp-form.css');

    // First, enqueue custom JavaScript file
    wp_enqueue_script('mmp-form-script', plugin_dir_url(__FILE__) . 'templates/custom/ragas.online/join-us/js/mmp-form.js', array('jquery'), null, true);

    // Then, localize it with global/environment variables
    $localization_array = array(
        'recaptcha_site_key' => get_option('mmp_custom_form_settings')['mmp_custom_form_recaptcha_site_key'],
        'account_ID' => get_option('mmp_custom_form_settings')['AccountID'],
        'BID' => get_option('mmp_custom_form_settings')['BID'],
        'account_email' => get_option('mmp_custom_form_settings')['AccountEmail']
    );
    wp_localize_script('mmp-form-script', 'mmpFormOptions', $localization_array);

    // Include the form HTML from an external file
    // $form_html = file_get_contents(plugin_dir_path(__FILE__) . 'templates/mmp-form.html');
    $form_html = file_get_contents(plugin_dir_path(__FILE__) . 'templates/custom/ragas.online/join-us/mmp-form.html');

    // Return the form HTML as part of the shortcode output
    return $form_html;
}
add_shortcode('mmp_custom_form', 'mmp_custom_form_script_shortcode');

// validate and verify captcha responses
require_once plugin_dir_path(__FILE__) . 'inc/captcha-verification.php';
