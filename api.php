<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Database config
$host = 'localhost';
$dbname = 'zqmod_keys';
$username = 'your_db_user';
$password = 'your_db_password';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die(json_encode(['success' => false, 'message' => 'Database connection failed']));
}

// Create table if not exists
$createTable = "
CREATE TABLE IF NOT EXISTS user_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    user_key VARCHAR(100) UNIQUE NOT NULL,
    status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 30 DAY),
    last_used TIMESTAMP NULL,
    ip_address VARCHAR(45)
)";
$pdo->exec($createTable);

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? $_GET['action'] ?? '';

switch($action) {
    case 'generate':
        generateKey($pdo, $input);
        break;
    case 'verify':
        verifyKey($pdo, $input);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function generateKey($pdo, $input) {
    $username = trim($input['username'] ?? '');
    $email = trim($input['email'] ?? '');
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    
    if (empty($username) || strlen($username) < 3) {
        echo json_encode(['success' => false, 'message' => 'Username must be at least 3 characters']);
        return;
    }
    
    // Check if username already has an active key
    $stmt = $pdo->prepare("SELECT user_key FROM user_keys WHERE username = ? AND status = 'active' AND expires_at > NOW()");
    $stmt->execute([$username]);
    
    if ($stmt->rowCount() > 0) {
        $existingKey = $stmt->fetchColumn();
        echo json_encode([
            'success' => true, 
            'key' => $existingKey,
            'message' => 'Using existing active key'
        ]);
        return;
    }
    
    // Generate unique key
    $key = 'ZQKEY_' . strtoupper(bin2hex(random_bytes(8))) . '_' . time();
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO user_keys (username, email, user_key, ip_address) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$username, $email, $key, $ip]);
        
        echo json_encode([
            'success' => true,
            'key' => $key,
            'expires' => date('Y-m-d H:i:s', strtotime('+30 days'))
        ]);
    } catch(PDOException $e) {
        if ($e->getCode() == 23000) { // Duplicate key
            generateKey($pdo, $input); // Retry
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to generate key']);
        }
    }
}

function verifyKey($pdo, $input) {
    $key = trim($input['key'] ?? $_GET['key'] ?? '');
    
    if (empty($key)) {
        echo json_encode(['success' => false, 'message' => 'Key is required']);
        return;
    }
    
    $stmt = $pdo->prepare("
        SELECT username, email, status, expires_at 
        FROM user_keys 
        WHERE user_key = ?
    ");
    $stmt->execute([$key]);
    
    if ($stmt->rowCount() === 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid key']);
        return;
    }
    
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($row['status'] !== 'active') {
        echo json_encode(['success' => false, 'message' => 'Key is inactive']);
        return;
    }
    
    if (strtotime($row['expires_at']) < time()) {
        // Mark as expired
        $updateStmt = $pdo->prepare("UPDATE user_keys SET status = 'expired' WHERE user_key = ?");
        $updateStmt->execute([$key]);
        
        echo json_encode(['success' => false, 'message' => 'Key has expired']);
        return;
    }
    
    // Update last used
    $updateStmt = $pdo->prepare("UPDATE user_keys SET last_used = NOW() WHERE user_key = ?");
    $updateStmt->execute([$key]);
    
    echo json_encode([
        'success' => true,
        'username' => $row['username'],
        'expires' => $row['expires_at']
    ]);
}
?>
