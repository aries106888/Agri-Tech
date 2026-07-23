<?php
/**
 * Agri-Tech Database Connection Configuration
 * Supports MySQL / MariaDB via PDO with fallback & environment variables
 */

$host     = getenv('DB_HOST')     ?: '127.0.0.1';
$port     = getenv('DB_PORT')     ?: '3306';
$dbname   = getenv('DB_NAME')     ?: 'shambapoint';
$user     = getenv('DB_USER')     ?: 'shambapoint_app';
$password = getenv('DB_PASSWORD') ?: 'shamba_secure_pass_123!';
$charset  = 'utf8mb4';

$dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset={$charset}";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $password, $options);
} catch (\PDOException $e) {
    // If DB is unavailable, fail gracefully or allow demo fallback
    $pdo = null;
    error_log("Database Connection Warning: " . $e->getMessage());
}
?>
