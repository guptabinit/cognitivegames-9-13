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

    // 2. Save forward span trials
    if (!empty($data['forwardTrials'])) {
        $stmt = $conn->prepare("INSERT INTO game3_fwdspan 
            (player_id, span_length, sequence, user_answer, is_correct, response_time_ms)
            VALUES (?, ?, ?, ?, ?, ?)");
        
        foreach ($data['forwardTrials'] as $trial) {
            $stmt->bind_param("iissii",
                $player_id,
                $trial['spanLength'],
                $trial['sequence'],
                $trial['userAnswer'],
                $trial['isCorrect'] ? 1 : 0,
                $trial['responseTimeMs']
            );
            $stmt->execute();
        }
    }

    // 3. Save backward span trials
    if (!empty($data['backwardTrials'])) {
        $stmt = $conn->prepare("INSERT INTO game3_backspan 
            (player_id, span_length, sequence, user_answer, is_correct, response_time_ms)
            VALUES (?, ?, ?, ?, ?, ?)");
        
        foreach ($data['backwardTrials'] as $trial) {
            $stmt->bind_param("iissii",
                $player_id,
                $trial['spanLength'],
                $trial['sequence'],
                $trial['userAnswer'],
                $trial['isCorrect'] ? 1 : 0,
                $trial['responseTimeMs']
            );
            $stmt->execute();
        }
    }

    // 4. Save processing speed data
    if (!empty($data['processingSpeed'])) {
        $stmt = $conn->prepare("INSERT INTO game3_processspd 
            (player_id, avg_response_time_ms, adjustment_value)
            VALUES (?, ?, ?)");
        
        $stmt->bind_param("idd",
            $player_id,
            $data['processingSpeed']['avgResponseTimeMs'],
            $data['processingSpeed']['adjustmentValue']
        );
        $stmt->execute();
    }

    // 5. Save memory rating
    if (!empty($data['memoryRating'])) {
        $stmt = $conn->prepare("INSERT INTO game3_memrating 
            (player_id, forward_span, backward_span, forward_score, backward_score, 
            speed_adjustment, final_rating)
            VALUES (?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->bind_param("iiiiidi",
            $player_id,
            $data['memoryRating']['forwardSpan'],
            $data['memoryRating']['backwardSpan'],
            $data['memoryRating']['forwardScore'],
            $data['memoryRating']['backwardScore'],
            $data['memoryRating']['speedAdjustment'],
            $data['memoryRating']['finalRating']
        );
        $stmt->execute();
    }

    // Commit transaction
    $conn->commit();
    
    // Return success response
    echo json_encode([
        'status' => 'success',
        'message' => 'Game data saved successfully',
        'playerId' => $player_id
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to save game data: ' . $e->getMessage()
    ]);
}

// Close connection
if (isset($conn)) {
    $conn->close();
}
