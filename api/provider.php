<?php
/**
 * Bremo Care — provider application endpoint.
 * Wired to join.html via data-endpoint="/api/provider.php".
 */
require __DIR__ . '/_lib.php';

bremo_handle(
    'provider',
    ['name', 'email', 'profession', 'regulator', 'license_number', 'region', 'attest'],
    [
        'name'           => 'Full name',
        'email'          => 'Email',
        'phone'          => 'Phone',
        'profession'     => 'Profession',
        'regulator'      => 'Regulatory body',
        'license_number' => 'Registration / licence #',
        'region'         => 'Licensed region',
        'specialties'    => 'Specialties & approach',
        'modality'       => 'Sees clients',
        'availability'   => 'Availability',
        'attest'         => 'Attested licence in good standing',
    ]
);
