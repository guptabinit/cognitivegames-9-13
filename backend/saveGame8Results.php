<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php';

// Function to log errors
function logError($message, $data = []) {
    $logMessage = '[' . date('Y-m-d H:i:s') . '] ' . $message . "\n";
    if (!empty($data)) {
        $logMessage .= 'Data: ' . print_r($data, true) . "\n";
    }
    error_log($logMessage, 3, __DIR__ . '/game8_errors.log');
}

// Get the raw POST data
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Log incoming request
logError('Incoming request', [
    'raw_post' => $json,
    'parsed_data' => $data,
    'request_method' => $_SERVER['REQUEST_METHOD'],
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? ''
]);

if (!$data) {
    $error = json_last_error_msg();
    logError('Invalid JSON data', ['error' => $error, 'raw' => $json]);
    http_response_code(400);
    echo json_encode([
        'status' => 'error', 
        'message' => 'Invalid JSON data',
        'error' => $error
    ]);
    exit();
}

// Start transaction
$conn->begin_transaction();

try {
    // 1. Process player data with proper validation
    $player = is_array($data['player'] ?? null) ? $data['player'] : [];
    
    // Safely get and escape nickname
    $nickname = 'Anonymous';
    if (isset($player['nickname'])) {
        if (is_string($player['nickname'])) {
            $nickname = $conn->real_escape_string($player['nickname']);
        } elseif (is_array($player['nickname'])) {
            $nickname = $conn->real_escape_string(json_encode($player['nickname']));
        }
    }
    
    // Safely get and escape avatar
    $avatar = '👤';
    if (isset($player['avatar'])) {
        if (is_string($player['avatar'])) {
            $avatar = $conn->real_escape_string($player['avatar']);
        } elseif (is_array($player['avatar'])) {
            $avatar = $conn->real_escape_string(json_encode($player['avatar']));
        }
    }
    
    // Check if player exists
    $stmt = $conn->prepare("SELECT player_id FROM players WHERE nickname = ?");
    $stmt->bind_param("s", $nickname);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $player = $result->fetch_assoc();
        $player_id = $player['player_id'];
    } else {
        // Insert new player
        $stmt = $conn->prepare("INSERT INTO players (nickname, avatar) VALUES (?, ?)");
        $stmt->bind_param("ss", $nickname, $avatar);
        $stmt->execute();
        $player_id = $conn->insert_id;
    }

    // 2. Save game results - with proper validation
    $perspective_score = isset($data['perspective_score']) ? intval($data['perspective_score']) : 0;
    $perspective_rating = isset($data['perspective_rating']) ? 
        $conn->real_escape_string(is_string($data['perspective_rating']) ? $data['perspective_rating'] : '') : '';
    $social_factor_score = isset($data['social_factor_score']) ? intval($data['social_factor_score']) : 0;
    $social_factor_rating = isset($data['social_factor_rating']) ? 
        $conn->real_escape_string(is_string($data['social_factor_rating']) ? $data['social_factor_rating'] : '') : '';

    $stmt = $conn->prepare("
        INSERT INTO game8_results 
        (player_id, perspective_score, perspective_rating, social_factor_score, social_factor_rating) 
        VALUES (?, ?, ?, ?, ?)
    ");
    
    $stmt->bind_param(
        "iisss", 
        $player_id, 
        $perspective_score, 
        $perspective_rating,
        $social_factor_score,
        $social_factor_rating
    );
    
    $executeResult = $stmt->execute();
    
    if (!$executeResult) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }
    
    $insertId = $conn->insert_id;
    
    // Commit transaction
    $commitResult = $conn->commit();
    
    if (!$commitResult) {
        throw new Exception('Commit failed: ' . $conn->error);
    }
    
    logError('Data saved successfully', [
        'player_id' => $player_id,
        'insert_id' => $insertId,
        'data' => [
            'perspective_score' => $perspective_score,
            'social_factor_score' => $social_factor_score
        ]
    ]);
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Results saved successfully',
        'player_id' => $player_id,
        'insert_id' => $insertId,
        'debug' => [
            'rows_affected' => $stmt->affected_rows,
            'last_insert_id' => $insertId
        ]
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    if (isset($conn)) {
        $conn->rollback();
    }
    
    $errorMessage = 'Failed to save results: ' . $e->getMessage();
    $errorData = [
        'error' => $e->getMessage(),
        'code' => $e->getCode(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ];
    
    logError($errorMessage, $errorData);
    
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $errorMessage,
        'debug' => $errorData,
        'mysql_error' => $conn->error ?? null,
        'mysql_errno' => $conn->errno ?? null
    ]);
}

$conn->close();
?>
