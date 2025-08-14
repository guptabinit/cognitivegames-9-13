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

    // 2. Save emotion responses
    $responses = $data['responses'];
    $correct_answers = 0;
    $total_response_time = 0;
    
    $stmt = $conn->prepare("INSERT INTO game5_emotion_responses 
        (player_id, question_id, correct_emotion, selected_emotion, is_correct, 
        response_time_ms, intensity, age_group) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    
    foreach ($responses as $response) {
        $is_correct = $response['selectedEmotion'] === $response['correctEmotion'] ? 1 : 0;
        $correct_answers += $is_correct;
        $total_response_time += $response['responseTime'];
        
        $stmt->bind_param(
            "iissiiss",
            $player_id,
            $response['questionId'],
            $response['correctEmotion'],
            $response['selectedEmotion'],
            $is_correct,
            $response['responseTime'],
            $response['intensity'],
            $response['ageGroup']
        );
        $stmt->execute();
    }
    
    // 3. Calculate results
    $total_questions = count($responses);
    $accuracy = $total_questions > 0 ? ($correct_answers / $total_questions) * 100 : 0;
    $avg_response_time = $total_questions > 0 ? $total_response_time / $total_questions : 0;
    
    // 4. Save results
    $resultStmt = $conn->prepare("INSERT INTO game5_results 
        (player_id, total_questions, correct_answers, accuracy, avg_response_time)
        VALUES (?, ?, ?, ?, ?)");
    
    $resultStmt->bind_param(
        "iiidd",
        $player_id,
        $total_questions,
        $correct_answers,
        $accuracy,
        $avg_response_time
    );
    $resultStmt->execute();
    
    // Commit transaction
    $conn->commit();
    
    // Return success response with results
    echo json_encode([
        'status' => 'success',
        'player_id' => $player_id,
        'results' => [
            'total_questions' => $total_questions,
            'correct_answers' => $correct_answers,
            'accuracy' => round($accuracy, 2),
            'avg_response_time' => round($avg_response_time, 2)
        ]
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to save results',
        'error' => $e->getMessage()
    ]);
}

$conn->close();
?>
