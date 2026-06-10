<?php

declare(strict_types=1);

/**
 * Railway / panel copy-paste often adds trailing newlines to env values.
 * Must run before config is loaded or config:cache is built (e.g. DB_CONNECTION=mysql\n).
 */
$keys = [
    'APP_ENV', 'APP_KEY', 'APP_DEBUG', 'APP_URL',
    'DB_CONNECTION', 'DB_HOST', 'DB_PORT', 'DB_DATABASE', 'DB_USERNAME', 'DB_PASSWORD', 'DB_URL',
    'DATABASE_URL', 'MYSQL_URL', 'MYSQLHOST', 'MYSQL_HOST', 'MYSQLPORT', 'MYSQL_PORT',
    'MYSQLUSER', 'MYSQLPASSWORD', 'MYSQLDATABASE', 'MYSQL_DATABASE', 'MYSQL_ROOT_PASSWORD',
    'SESSION_DRIVER', 'CACHE_STORE', 'QUEUE_CONNECTION',
];

foreach ($keys as $key) {
    $raw = getenv($key);
    if ($raw === false || ! is_string($raw)) {
        continue;
    }
    $trimmed = trim($raw);
    if ($trimmed === $raw) {
        continue;
    }
    putenv("{$key}={$trimmed}");
    $_ENV[$key] = $trimmed;
    $_SERVER[$key] = $trimmed;
}
