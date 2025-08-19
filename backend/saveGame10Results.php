<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set JSON content type and CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include database connection
require_once 'db.php';

// Get raw input
$json = file_get_contents('php://input');
if ($json === false) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Failed to read input data']);
    exit();
}

// Decode JSON
$data = json_decode(trim($json), true);

// Log the raw input for debugging (without sensitive data)
$logData = [
    'request_method' => $_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN',
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'not set',
    'input_length' => strlen($json),
    'json_error' => json_last_error() !== JSON_ERROR_NONE ? json_last_error_msg() : null
];
error_log('Received request: ' . print_r($logData, true));

// Check for JSON decode errors
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid JSON data',
        'error' => json_last_error_msg(),
        'input_sample' => substr($json, 0, 100) // Only return first 100 chars of input
    ]);
    exit();
}

// Validate required fields
$requiredFields = [
    'player' => ['nickname'],
    'ageGroup' => null,
    'choice' => null,
    'waitDuration' => null,
    'reasoning' => null,
    'rawScore' => null,
    'likertScore' => null,
    'interpretation' => null
];

$missing = [];
foreach ($requiredFields as $field => $subFields) {
    if (!isset($data[$field])) {
        $missing[] = $field;
    } elseif (is_array($subFields) && is_array($data[$field])) {
        // Check nested required fields
        foreach ($subFields as $subField) {
            if (!isset($data[$field][$subField])) {
                $missing[] = "$field.$subField";
            }
        }
    }
}

if (!empty($missing)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Missing required fields',
        'missing_fields' => $missing
    ]);
    exit();
}

// Start transaction
$conn->begin_transaction();

try {
    // 1. Insert or get player
    $nickname = $conn->real_escape_string($data['player']['nickname']);
    $avatar = $conn->real_escape_string($data['player']['avatar'] ?? 'default');
    
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

    // 2. Save game results
    $age_group = $conn->real_escape_string($data['ageGroup']);
    $choice = $conn->real_escape_string($data['choice']);
    $wait_duration = intval($data['waitDuration']);
    $reasoning = $conn->real_escape_string($data['reasoning']);
    $raw_score = floatval($data['rawScore']);
    $likert_score = intval($data['likertScore']);
    $interpretation = $conn->real_escape_string($data['interpretation']);

    $stmt = $conn->prepare("
        INSERT INTO game10_results (
            player_id, age_group, choice, wait_duration, reasoning, 
            raw_score, likert_score, interpretation
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->bind_param(
        "issisdis",
        $player_id,
        $age_group,
        $choice,
        $wait_duration,
        $reasoning,
        $raw_score,
        $likert_score,
        $interpretation
    );

    if (!$stmt->execute()) {
        throw new Exception('Failed to save game results: ' . $stmt->error);
    }

    $result_id = $conn->insert_id;
    $conn->commit();

    // Return success response
    echo json_encode([
        'status' => 'success',
        'message' => 'Results saved successfully',
        'data' => [
            'player_id' => $player_id,
            'result_id' => $result_id,
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);

} catch (Exception $e) {
    // Rollback transaction on error
    if (isset($conn) && $conn) {
        $conn->rollback();
    }

    // Log the error
    error_log('Error in saveGame10Results: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());

    // Return error response
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to save results',
        'error' => $e->getMessage()
    ]);
}

$conn->close();
?>
