<?php
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

// Get the raw POST data
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON data']);
    exit();
}

// Start transaction
$conn->begin_transaction();

try {
    // 1. Insert or get player
    $nickname = $conn->real_escape_string($data['player']['nickname']);
    $avatar = $conn->real_escape_string($data['player']['avatar']);
    
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
    
    // 2. Insert game session
    $age_group = $conn->real_escape_string($data['ageGroup']);
    $difficulty_tier = $conn->real_escape_string($data['difficultyTier']);
    
    $stmt = $conn->prepare("INSERT INTO game_sessions (player_id, age_group, difficulty_tier, end_time) VALUES (?, ?, ?, NOW())");
    $stmt->bind_param("iss", $player_id, $age_group, $difficulty_tier);
    $stmt->execute();
    $session_id = $conn->insert_id;
    
    // 3. Insert game rounds
    $roundStmt = $conn->prepare("INSERT INTO game_rounds 
        (session_id, triad_id, word1, word2, word3, correct_word, user_answer, is_correct, time_taken, choice_changes, error_type) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    foreach ($data['responses'] as $response) {
        $triad_id = $response['triadId'];
        $words = $response['words'];
        $correct_word = $response['correctWord'];
        $user_answer = $response['userAnswer'];
        $is_correct = $response['isCorrect'] ? 1 : 0;
        $time_taken = $response['timeTaken'];
        $choice_changes = $response['choiceChanges'];
        $error_type = $response['errorType'] ?? null;
        
        $roundStmt->bind_param(
            "issssssidss",
            $session_id,
            $triad_id,
            $words[0], $words[1], $words[2],
            $correct_word,
            $user_answer,
            $is_correct,
            $time_taken,
            $choice_changes,
            $error_type
        );
        $roundStmt->execute();
    }
    
    // 4. Insert final results
    $scores = $data['scores'];
    $resultStmt = $conn->prepare("INSERT INTO game_results 
        (session_id, accuracy_score, accuracy_value, reasoning_score, reasoning_value, 
        speed_score, speed_value, error_pattern_score, error_pattern_value, overall_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $resultStmt->bind_param(
        "iisisissii",
        $session_id,
        $scores['accuracy']['score'],
        $scores['accuracy']['value'],
        $scores['reasoning']['score'],
        $scores['reasoning']['value'],
        $scores['speed']['score'],
        $scores['speed']['value'],
        $scores['errorPattern']['score'],
        $scores['errorPattern']['value'],
        $scores['overall']['score']
    );
    $resultStmt->execute();
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Game results saved successfully',
        'sessionId' => $session_id
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to save game results: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
