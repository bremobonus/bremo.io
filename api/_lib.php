<?php
/**
 * Bremo Care — shared submission handling.
 *
 * Accepts a JSON (or form-encoded) POST, validates it, emails the notify
 * address, and appends a CSV row. Returns JSON. No external dependencies —
 * runs on stock DreamHost/shared PHP.
 */

declare(strict_types=1);

function bremo_config(): array {
    static $cfg = null;
    if ($cfg === null) { $cfg = require __DIR__ . '/config.php'; }
    return $cfg;
}

function bremo_json(int $status, array $body): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($body);
    exit;
}

/** Read the POST payload whether it's JSON or a normal form post. */
function bremo_read_input(): array {
    $ctype = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($ctype, 'application/json') !== false) {
        $raw = file_get_contents('php://input') ?: '';
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }
    return $_POST;
}

/** Collapse a value (which may be an array of checkboxes) to a clean string. */
function bremo_flatten($v): string {
    if (is_array($v)) { $v = implode(', ', array_map('strval', $v)); }
    $v = (string) $v;
    // Strip control chars that enable header injection; keep newlines for bodies.
    return trim($v);
}

/** Remove anything that could inject email headers (for subject/from-ish fields). */
function bremo_headersafe(string $v): string {
    return trim(preg_replace('/[\r\n]+/', ' ', $v));
}

function bremo_client_ip(): string {
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

/** Very small file-based per-IP rate limiter. Fails open on any error. */
function bremo_rate_limited(string $dataDir): bool {
    $cfg = bremo_config();
    $limit = (int) ($cfg['rate_limit_per_hour'] ?? 12);
    if ($limit <= 0) { return false; }
    $file = $dataDir . '/rate_' . md5(bremo_client_ip()) . '.json';
    $now = time();
    $hits = [];
    if (is_readable($file)) {
        $hits = json_decode((string) file_get_contents($file), true) ?: [];
    }
    $hits = array_values(array_filter($hits, fn($t) => ($now - (int) $t) < 3600));
    if (count($hits) >= $limit) { return true; }
    $hits[] = $now;
    @file_put_contents($file, json_encode($hits), LOCK_EX);
    return false;
}

/**
 * Handle one submission.
 *
 * @param string $type       Short slug, e.g. "intake" or "provider".
 * @param array  $required   Field keys that must be present and non-empty.
 * @param array  $fields     Ordered map of field key => human label (for email/CSV).
 */
function bremo_handle(string $type, array $required, array $fields): void {
    // CORS / method guard — same-origin form posts only need POST.
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        bremo_json(405, ['ok' => false, 'error' => 'Method not allowed']);
    }

    $cfg = bremo_config();
    $dataDir = $cfg['data_dir'];
    if (!is_dir($dataDir)) { @mkdir($dataDir, 0750, true); }

    $in = bremo_read_input();

    // Honeypot: real users never fill the hidden "website" field. Bots do.
    // Pretend success so the bot moves on, but store nothing.
    if (!empty($in['website'])) {
        bremo_json(200, ['ok' => true]);
    }

    if (bremo_rate_limited($dataDir)) {
        bremo_json(429, ['ok' => false, 'error' => 'Too many submissions. Please try again later.']);
    }

    // Validate required fields.
    $missing = [];
    foreach ($required as $key) {
        if (bremo_flatten($in[$key] ?? '') === '') { $missing[] = $key; }
    }
    if ($missing) {
        bremo_json(422, ['ok' => false, 'error' => 'Please complete the required fields.', 'fields' => $missing]);
    }

    // Basic size guard against abuse.
    $total = 0;
    foreach ($in as $v) { $total += strlen(is_array($v) ? implode('', $v) : (string) $v); }
    if ($total > 20000) {
        bremo_json(413, ['ok' => false, 'error' => 'Submission too large.']);
    }

    // Build ordered, labelled values.
    $rows = [];
    foreach ($fields as $key => $label) {
        if ($key === 'website') { continue; }
        $rows[$label] = bremo_flatten($in[$key] ?? '');
    }
    $rows['IP'] = bremo_client_ip();
    $rows['Received'] = gmdate('Y-m-d H:i:s') . ' UTC';

    $emailed = bremo_send_email($type, $rows);
    $logged  = bremo_append_csv($dataDir . "/{$type}.csv", $rows);

    if (!$emailed && !$logged) {
        bremo_json(500, ['ok' => false, 'error' => 'We could not record your submission. Please try again.']);
    }

    bremo_json(200, ['ok' => true]);
}

function bremo_send_email(string $type, array $rows): bool {
    $cfg = bremo_config();
    $to = $cfg['notify_email'];
    if (!$to) { return false; }

    $who = bremo_headersafe($rows['Name'] ?? ($rows['Full name'] ?? 'Someone'));
    $subject = "[{$cfg['site_name']}] New {$type} lead — {$who}";

    $lines = ["New {$type} submission from " . $cfg['site_name'] . ":", ''];
    foreach ($rows as $label => $val) {
        $lines[] = $label . ': ' . str_replace("\n", "\n    ", $val);
    }
    $body = implode("\n", $lines) . "\n";

    $from = bremo_headersafe($cfg['from_email']);
    $replyTo = filter_var($rows['Email'] ?? '', FILTER_VALIDATE_EMAIL) ?: $from;
    $headers = implode("\r\n", [
        'From: ' . $cfg['site_name'] . ' <' . $from . '>',
        'Reply-To: ' . $replyTo,
        'Content-Type: text/plain; charset=utf-8',
        'X-Mailer: BremoCare',
    ]);

    return @mail($to, bremo_headersafe($subject), $body, $headers);
}

function bremo_append_csv(string $path, array $rows): bool {
    $newFile = !file_exists($path);
    $fh = @fopen($path, 'a');
    if (!$fh) { return false; }
    if (flock($fh, LOCK_EX)) {
        if ($newFile) { fputcsv($fh, array_keys($rows)); }
        fputcsv($fh, array_values($rows));
        fflush($fh);
        flock($fh, LOCK_UN);
    }
    fclose($fh);
    return true;
}
