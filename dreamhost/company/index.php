<?php
/**
 * /company/ on DreamHost is a directory (/company redirects here).
 * index.html is the full-screen game. This file serves that same page
 * when DirectoryIndex prefers index.php.
 */
header('Content-Type: text/html; charset=UTF-8');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store, max-age=0');
$html = __DIR__ . '/index.html';
if (!is_file($html)) {
    http_response_code(500);
    echo 'index.html must sit beside index.php in /company/';
    exit;
}
readfile($html);
