<?php
/**
 * Bremo Care — backend configuration.
 *
 * EDIT THIS FILE after deploying. These are the only settings you normally touch.
 */

return [
    // Where new leads are emailed. Change to your Bremo inbox when ready.
    'notify_email' => 'plasmadonatecanada@gmail.com',

    // The "From" address shown on notification emails. For best deliverability
    // this should be an address on your own domain (e.g. no-reply@bremo.space).
    'from_email'   => 'no-reply@bremo.space',

    // Site name used in email subjects.
    'site_name'    => 'Bremo Care',

    // Where submissions are also logged as CSV, one file per form type.
    // This directory is protected from the web by api/data/.htaccess.
    'data_dir'     => __DIR__ . '/data',

    // Simple rate limit: max submissions allowed per IP per hour.
    'rate_limit_per_hour' => 12,
];
