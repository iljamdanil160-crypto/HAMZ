<?php
// Database Configuration
class Config {
    // Database settings - Use environment variables for Railway
    public const DB_HOST = $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?? 'localhost';
    public const DB_NAME = $_ENV['DB_NAME'] ?? getenv('DB_NAME') ?? 'todoapp';
    public const DB_USER = $_ENV['DB_USER'] ?? getenv('DB_USER') ?? 'root';
    public const DB_PASS = $_ENV['DB_PASS'] ?? getenv('DB_PASS') ?? '';
    
    // JWT Secret - Use environment variable in production
    public const JWT_SECRET = $_ENV['JWT_SECRET'] ?? getenv('JWT_SECRET') ?? 'dev-secret-key-change-in-production';
    
    // Application settings
    public const APP_NAME = $_ENV['APP_NAME'] ?? getenv('APP_NAME') ?? 'Todo App';
    public const TOKEN_EXPIRE = 86400; // 24 hours
}

// Database connection
function getDBConnection() {
    try {
        $pdo = new PDO(
            "mysql:host=" . Config::DB_HOST . ";dbname=" . Config::DB_NAME . ";charset=utf8mb4",
            Config::DB_USER,
            Config::DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database connection failed']);
        exit;
    }
}

// JWT Functions
function generateToken($userId) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'user_id' => $userId,
        'exp' => time() + Config::TOKEN_EXPIRE
    ]);
    
    $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, Config::JWT_SECRET, true);
    $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64Header . "." . $base64Payload . "." . $base64Signature;
}

function verifyToken($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }
    
    list($header, $payload, $signature) = $parts;
    
    $validSignature = str_replace(['+', '/', '='], ['-', '_', ''], 
        base64_encode(hash_hmac('sha256', $header . "." . $payload, Config::JWT_SECRET, true))
    );
    
    if (!hash_equals($signature, $validSignature)) {
        return false;
    }
    
    $data = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload)), true);
    
    if (!$data || $data['exp'] < time()) {
        return false;
    }
    
    return $data;
}

// Response helper
function jsonResponse($data, $httpCode = 200) {
    http_response_code($httpCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// CORS headers for Railway
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}
?>