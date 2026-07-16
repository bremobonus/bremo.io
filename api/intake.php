<?php
/**
 * Bremo Care — care-seeker intake endpoint.
 * Wired to find-care.html via data-endpoint="/api/intake.php".
 */
require __DIR__ . '/_lib.php';

bremo_handle(
    'intake',
    ['care_type', 'situation', 'name', 'email', 'consent'],
    [
        'care_type'   => 'Type of support',
        'situation'   => "What's bringing them here",
        'modality'    => 'Preferred format',
        'location'    => 'City / province',
        'language'    => 'Preferred language(s)',
        'preferences' => 'Other preferences',
        'name'        => 'Name',
        'email'       => 'Email',
        'phone'       => 'Phone',
        'consent'     => 'Consent given',
    ]
);
