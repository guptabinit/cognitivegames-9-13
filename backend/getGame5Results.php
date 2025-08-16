<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php';

try {
    // Get the most recent game result for now
    // In a real app, you might want to pass a player_id or session_id
    $query = "
        SELECT 
            r.*,
            p.nickname,
            p.avatar
        FROM game5_results r
        JOIN players p ON r.player_id = p.player_id
        ORDER BY r.created_at DESC
        LIMIT 1
    ";

    $result = $conn->query($query);
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'No results found']);
        exit();
    }

    $gameResult = $result->fetch_assoc();

    // Get emotion-wise accuracy
    $emotionAccuracy = [];
    $emotionQuery = "
        SELECT 
            correct_emotion,
            COUNT(*) as total,
            SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct,
            (SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0) / COUNT(*)) * 100 as accuracy,
            AVG(response_time_ms) as avg_time
        FROM game5_emotion_responses
        WHERE player_id = ?
        GROUP BY correct_emotion
    ";
    
    $stmt = $conn->prepare($emotionQuery);
    $stmt->bind_param("i", $gameResult['player_id']);
    $stmt->execute();
    $emotionResult = $stmt->get_result();
    
    $emotionAccuracy = [];
    $emotionResponseTime = [];
    
    while ($row = $emotionResult->fetch_assoc()) {
        $emotion = ucfirst(strtolower($row['correct_emotion']));
        $emotionAccuracy[$emotion] = round($row['accuracy'], 1);
        $emotionResponseTime[$emotion] = round($row['avg_time'], 0);
    }
    
    // Get confusion matrix
    $confusionQuery = "
        SELECT 
            correct_emotion,
            selected_emotion,
            COUNT(*) as count
        FROM game5_emotion_responses
        WHERE player_id = ? AND is_correct = 0
        GROUP BY correct_emotion, selected_emotion
        ORDER BY count DESC
    ";
    
    $stmt = $conn->prepare($confusionQuery);
    $stmt->bind_param("i", $gameResult['player_id']);
    $stmt->execute();
    $confusionResult = $stmt->get_result();
    
    $confusionMatrix = [];
    while ($row = $confusionResult->fetch_assoc()) {
        $correct = ucfirst(strtolower($row['correct_emotion']));
        $selected = ucfirst(strtolower($row['selected_emotion']));
        
        if (!isset($confusionMatrix[$correct])) {
            $confusionMatrix[$correct] = [];
        }
        
        $confusionMatrix[$correct][$selected] = (int)$row['count'];
    }
    
    // Prepare response
    $response = [
        'status' => 'success',
        'player' => [
            'nickname' => $gameResult['nickname'],
            'avatar' => $gameResult['avatar']
        ],
        'game' => [
            'total_questions' => (int)$gameResult['total_questions'],
            'correct_answers' => (int)$gameResult['correct_answers'],
            'accuracy' => round(($gameResult['correct_answers'] / $gameResult['total_questions']) * 100, 1),
            'avg_response_time' => (float)$gameResult['avg_response_time'],
            'created_at' => $gameResult['created_at']
        ],
        'emotion_accuracy' => $emotionAccuracy,
        'emotion_response_time' => $emotionResponseTime,
        'confusion_matrix' => $confusionMatrix
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'An error occurred while fetching results',
        'error' => $e->getMessage()
    ]);
}

$conn->close();
?>
