<?php
require_once 'config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['action'])) {
    jsonResponse(['success' => false, 'message' => 'Invalid request'], 400);
}

$action = $input['action'];

switch ($action) {
    case 'register':
        handleRegister($input);
        break;
    case 'login':
        handleLogin($input);
        break;
    case 'verify':
        handleVerify($input);
        break;
    default:
        jsonResponse(['success' => false, 'message' => 'Invalid action'], 400);
}

function handleRegister($input) {
    // Validate input
    if (!isset($input['username']) || !isset($input['email']) || !isset($input['password'])) {
        jsonResponse(['success' => false, 'message' => 'Missing required fields'], 400);
    }
    
    $username = trim($input['username']);
    $email = trim($input['email']);
    $password = $input['password'];
    
    // Basic validation
    if (strlen($username) < 3 || strlen($username) > 50) {
        jsonResponse(['success' => false, 'message' => 'Username harus 3-50 karakter'], 400);
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['success' => false, 'message' => 'Format email tidak valid'], 400);
    }
    
    if (strlen($password) < 6) {
        jsonResponse(['success' => false, 'message' => 'Password minimal 6 karakter'], 400);
    }
    
    try {
        $pdo = getDBConnection();
        
        // Check if username or email exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$username, $email]);
        
        if ($stmt->fetch()) {
            jsonResponse(['success' => false, 'message' => 'Username atau email sudah digunakan'], 400);
        }
        
        // Create new user
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
        $stmt->execute([$username, $email, $hashedPassword]);
        
        $userId = $pdo->lastInsertId();
        
        jsonResponse(['success' => true, 'message' => 'Registrasi berhasil']);
        
    } catch (Exception $e) {
        jsonResponse(['success' => false, 'message' => 'Error database'], 500);
    }
}

function handleLogin($input) {
    // Validate input
    if (!isset($input['username']) || !isset($input['password'])) {
        jsonResponse(['success' => false, 'message' => 'Username dan password diperlukan'], 400);
    }
    
    $username = trim($input['username']);
    $password = $input['password'];
    
    try {
        $pdo = getDBConnection();
        
        // Find user by username or email
        $stmt = $pdo->prepare("SELECT id, username, email, password FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$username, $username]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($password, $user['password'])) {
            jsonResponse(['success' => false, 'message' => 'Username atau password salah'], 401);
        }
        
        // Generate token
        $token = generateToken($user['id']);
        
        jsonResponse([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email']
            ]
        ]);
        
    } catch (Exception $e) {
        jsonResponse(['success' => false, 'message' => 'Error database'], 500);
    }
}

function handleVerify($input) {
    if (!isset($input['token'])) {
        jsonResponse(['success' => false, 'message' => 'Token diperlukan'], 400);
    }
    
    $token = $input['token'];
    $payload = verifyToken($token);
    
    if (!$payload) {
        jsonResponse(['success' => false, 'message' => 'Token tidak valid'], 401);
    }
    
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("SELECT id, username, email FROM users WHERE id = ?");
        $stmt->execute([$payload['user_id']]);
        $user = $stmt->fetch();
        
        if (!$user) {
            jsonResponse(['success' => false, 'message' => 'User tidak ditemukan'], 404);
        }
        
        jsonResponse([
            'success' => true,
            'user' => $user
        ]);
        
    } catch (Exception $e) {
        jsonResponse(['success' => false, 'message' => 'Error database'], 500);
    }
}
?>