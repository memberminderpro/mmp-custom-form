<?php

add_action('admin_menu', 'mmp_custom_form_add_admin_menu');
add_action('admin_init', 'mmp_custom_form_settings_init');

function mmp_custom_form_add_admin_menu() { 
    add_menu_page('Join Us Form', 'Join Us Form', 'manage_options', 'mmp_custom_form', 'mmp_custom_form_options_page');
}

function mmp_custom_form_settings_init() { 
    register_setting('mmpPlugin', 'mmp_custom_form_settings', 'mmp_custom_form_settings_sanitize');

    add_settings_section(
        'mmp_custom_form_mmpPlugin_section', 
        __('Spam Protection Integration', 'mmp'), 
        'mmp_custom_form_settings_section_callback', 
        'mmpPlugin'
    );

    add_settings_field( 
        'mmp_custom_form_recaptcha_site_key', 
        __('reCAPTCHA Site Key', 'mmp'), 
        'mmp_custom_form_recaptcha_site_key_render', 
        'mmpPlugin', 
        'mmp_custom_form_mmpPlugin_section' 
    );

    add_settings_field( 
        'mmp_custom_form_recaptcha_secret_key', 
        __('reCAPTCHA Secret Key', 'mmp'), 
        'mmp_custom_form_recaptcha_secret_key_render', 
        'mmpPlugin', 
        'mmp_custom_form_mmpPlugin_section' 
    );

    add_settings_field( 
        'mmp_custom_form_account_id', 
        __('Account ID', 'mmp'), 
        'mmp_custom_form_account_id_render', 
        'mmpPlugin', 
        'mmp_custom_form_mmpPlugin_section' 
    );
    
    add_settings_field( 
        'mmp_custom_form_bid', 
        __('BID', 'mmp'), 
        'mmp_custom_form_bid_render', 
        'mmpPlugin', 
        'mmp_custom_form_mmpPlugin_section' 
    );
    
    add_settings_field( 
        'mmp_custom_form_account_email', 
        __('Account Email', 'mmp'), 
        'mmp_custom_form_account_email_render', 
        'mmpPlugin', 
        'mmp_custom_form_mmpPlugin_section' 
    );

    add_settings_field(
        'mmp_custom_form_debug_mode',
        'Enable Debug Mode',
        'mmp_custom_form_debug_mode_callback', 
        'mmpPlugin',
        'mmp_custom_form_mmpPlugin_section'
    );
}

function mmp_custom_form_recaptcha_site_key_render() { 
    // Fetch the settings with a default value in case they don't exist yet
    $options = get_option('mmp_custom_form_settings', array(
        'mmp_custom_form_recaptcha_site_key' => '', // Default value for site key
    ));
    ?>
    <input type='text' name='mmp_custom_form_settings[mmp_custom_form_recaptcha_site_key]' value='<?php echo esc_attr($options['mmp_custom_form_recaptcha_site_key']); ?>'>
    <?php
}

function mmp_custom_form_recaptcha_secret_key_render() { 
    $options = get_option('mmp_custom_form_settings', array(
        'mmp_custom_form_recaptcha_secret_key' => '' // Default value for secret key
    ));
    ?>
    <input type='text' name='mmp_custom_form_settings[mmp_custom_form_recaptcha_secret_key]' value='<?php echo esc_attr($options['mmp_custom_form_recaptcha_secret_key']); ?>'>
    <?php
}
function mmp_custom_form_account_id_render() { 
    $options = get_option('mmp_custom_form_settings', [
        'AccountID' => '' // Provide a default empty value
    ]);
    ?>
    <input type='text' name='mmp_custom_form_settings[AccountID]' value='<?php echo esc_attr($options['AccountID']); ?>'>
    <?php
}

function mmp_custom_form_bid_render() { 
    $options = get_option('mmp_custom_form_settings', [
        'BID' => '' // Provide a default empty value
    ]);
    ?>
    <input type='text' name='mmp_custom_form_settings[BID]' value='<?php echo esc_attr($options['BID']); ?>'>
    <?php
}
function mmp_custom_form_account_email_render() { 
    // Fetch the current settings, with a fallback to the WordPress admin email for the AccountEmail
    $options = get_option('mmp_custom_form_settings', [
        'AccountEmail' => get_option('admin_email') // Use WordPress admin email as default
    ]);
    ?>
    <input type='email' name='mmp_custom_form_settings[AccountEmail]' value='<?php echo esc_attr($options['AccountEmail']); ?>'>
    <?php
}

function mmp_custom_form_settings_section_callback() { 
    echo __('Please enter your reCAPTCHA keys here.', 'mmp');
}

function mmp_custom_form_options_page() { 
    ?>
    <form action='options.php' method='post'>
        <h2>Custom Membership Form Settings</h2>
        <?php
        settings_fields('mmpPlugin');
        do_settings_sections('mmpPlugin');
        submit_button();
        ?>
    </form>
    <?php
}

function mmp_custom_form_settings_sanitize($input) {
    $sanitized_input = array();
    
    // Sanitize the reCAPTCHA keys
    if (isset($input['mmp_custom_form_recaptcha_site_key'])) {
        $sanitized_input['mmp_custom_form_recaptcha_site_key'] = sanitize_text_field($input['mmp_custom_form_recaptcha_site_key']);
    }
    if (isset($input['mmp_custom_form_recaptcha_secret_key'])) {
        $sanitized_input['mmp_custom_form_recaptcha_secret_key'] = sanitize_text_field($input['mmp_custom_form_recaptcha_secret_key']);
    }

    // Sanitize the new fields: AccountID, BID, AccountEmail
    if (isset($input['AccountID'])) {
        $sanitized_input['AccountID'] = sanitize_text_field($input['AccountID']);
    }
    if (isset($input['BID'])) {
        $sanitized_input['BID'] = sanitize_text_field($input['BID']);
    }
    if (isset($input['AccountEmail'])) {
        $sanitized_input['AccountEmail'] = sanitize_email($input['AccountEmail']);
    }

    if (isset($input['debug_mode'])) {
        $sanitized_input['debug_mode'] = (bool) $input['debug_mode'];
    }

    return $sanitized_input;
}

function mmp_custom_form_debug_mode_callback() {
    $options = get_option('mmp_custom_form_settings');
    $debug_mode = isset($options['debug_mode']) ? $options['debug_mode'] : false;
    ?>
    <input type='checkbox' name='mmp_custom_form_settings[debug_mode]' <?php checked($debug_mode, true); ?>>
    <p class="description">When enabled, form submissions will display the data on screen instead of submitting to the endpoint.</p>
    <?php
}

register_setting('mmpPlugin', 'mmp_custom_form_settings', 'mmp_custom_form_settings_sanitize');
