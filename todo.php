<?php
require_once 'config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['action'])) {
    jsonResponse(['success' => false, 'message' => 'Invalid request'], 400);
}

// Verify authentication first
if (!isset($input['token'])) {
    jsonResponse(['success' => false, 'message' => 'Token diperlukan'], 401);
}

$payload = verifyToken($input['token']);
if (!$payload) {
    jsonResponse(['success' => false, 'message' => 'Token tidak valid'], 401);
}

$userId = $payload['user_id'];
$action = $input['action'];

switch ($action) {
    case 'get':
        getTodos($userId);
        break;
    case 'add':
        addTodo($userId, $input);
        break;
    case 'toggle':
        toggleTodo($userId, $input);
        break;
    case 'delete':
        deleteTodo($userId, $input);
        break;
    default:
        jsonResponse(['success' => false, 'message' => 'Invalid action'], 400);
}

function getTodos($userId) {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("SELECT id, text, completed, created_at, updated_at FROM todos WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        $todos = $stmt->fetchAll();
        
        jsonResponse([
            'success' => true,
            'todos' => $todos
        ]);
        
    } catch (Exception $e) {
        jsonResponse(['success' => false, 'message' => 'Error database'], 500);
    }
}

function addTodo($userId, $input) {
    if (!isset($input['text'])) {
        jsonResponse(['success' => false, 'message' => 'Text diperlukan'], 400);
    }
    
    $text = trim($input['text']);
    
    if (empty($text)) {
        jsonResponse(['success' => false, 'message' => 'Text tidak boleh kosong'], 400);
    }
    
    if (strlen($text) > 500) {
        jsonResponse(['success' => false, 'message' => 'Text maksimal 500 karakter'], 400);
    }
    
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("INSERT INTO todos (user_id, text) VALUES (?, ?)");
        $stmt->execute([$userId, $text]);
        
        $todoId = $pdo->lastInsertId();
        
        // Get the created todo
        $stmt = $pdo->prepare("SELECT id, text, completed, created_at, updated_at FROM todos WHERE id = ?");
        $stmt->execute([$todoId]);
        $todo = $stmt->fetch();
        
        jsonResponse([
            'success' => true,
            'todo' => $todo
        ]);
        
    } catch (Exception $e) {
        jsonResponse(['success' => false, 'message' => 'Error database'], 500);
    }
}

function toggleTodo($userId, $input) {
    if (!isset($input['id'])) {
        jsonResponse(['success' => false, 'message' => 'ID diperlukan'], 400);
    }
    
    $todoId = (int)$input['id'];
    
    try {
        $pdo = getDBConnection();
        
        // Verify todo belongs to user
        $stmt = $pdo->prepare("SELECT id, completed FROM todos WHERE id = ? AND user_id = ?");
        $stmt->execute([$todoId, $userId]);
        $todo = $stmt->fetch();
        
        if (!$todo) {
            jsonResponse(['success' => false, 'message' => 'Todo tidak ditemukan'], 404);
        }
        
        // Toggle completion status
        $newCompleted = $todo['completed'] ? 0 : 1;
        $stmt = $pdo->prepare("UPDATE todos SET completed = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$newCompleted, $todoId]);
        
        // Get updated todo
        $stmt = $pdo->prepare("SELECT id, text, completed, created_at, updated_at FROM todos WHERE id = ?");
        $stmt->execute([$todoId]);
        $updatedTodo = $stmt->fetch();
        
        jsonResponse([
            'success' => true,
            'todo' => $updatedTodo
        ]);
        
    } catch (Exception $e) {
        jsonResponse(['success' => false, 'message' => 'Error database'], 500);
    }
}

function deleteTodo($userId, $input) {
    if (!isset($input['id'])) {
        jsonResponse(['success' => false, 'message' => 'ID diperlukan'], 400);
    }
    
    $todoId = (int)$input['id'];
    
    try {
        $pdo = getDBConnection();
        
        // Verify todo belongs to user and delete
        $stmt = $pdo->prepare("DELETE FROM todos WHERE id = ? AND user_id = ?");
        $stmt->execute([$todoId, $userId]);
        
        if ($stmt->rowCount() === 0) {
            jsonResponse(['success' => false, 'message' => 'Todo tidak ditemukan'], 404);
        }
        
        jsonResponse([
            'success' => true,
            'message' => 'Todo berhasil dihapus'
        ]);
        
    } catch (Exception $e) {
        jsonResponse(['success' => false, 'message' => 'Error database'], 500);
    }
}
?>