<?php
/**
 * DreamHost file for the single-segment slug /gameplay.
 *
 * Unknown slugs on bremo.io return the plain text "Creator page not found."
 * A real gameplay.php (and gameplay.html) is what keeps this slug out of that catch-all.
 * strategy.php is the same kind of file: /strategy.php and /strategy both resolve.
 *
 * If a gameplay/ directory also exists, Apache sends /gameplay to /gameplay/
 * and this file is skipped for that URL. The directory copy is gameplay/index.php.
 */
header('Content-Type: text/html; charset=UTF-8');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store, max-age=0');

$html = __DIR__ . '/gameplay.html';
if (!is_file($html)) {
    http_response_code(500);
    echo 'gameplay.html must sit in the same folder as gameplay.php';
    exit;
}
readfile($html);
