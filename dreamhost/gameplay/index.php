<?php
/**
 * Serves /gameplay/ when the gameplay directory already exists on DreamHost.
 * Deletes the old static hub index if it is still here, or this file wins
 * when DirectoryIndex lists index.php first. index.html in this folder is
 * the same page, so either index wins.
 */
header('Content-Type: text/html; charset=UTF-8');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store, max-age=0');

$html = dirname(__DIR__) . '/gameplay.html';
if (!is_file($html)) {
    http_response_code(500);
    echo 'Missing ../gameplay.html';
    exit;
}
readfile($html);
