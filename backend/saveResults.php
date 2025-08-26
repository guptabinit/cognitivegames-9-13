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

// Determine game type (default to 'game1' for backward compatibility)
$gameType = isset($data['gameType']) ? $data['gameType'] : 'game1';

// Start transaction
$conn->begin_transaction();

try {
    $gameType = isset($data['gameType']) ? $conn->real_escape_string($data['gameType']) : 'arrow_game';
    
    // Handle arrow game results
    if ($gameType === 'arrow_game') {
        if (!isset($data['results']) || !isset($data['playerName'])) {
            throw new Exception('Missing required data: results or playerName');
        }
        
        $playerName = $conn->real_escape_string($data['playerName']);
        $results = $data['results'];
        
        // Prepare data
        $finalScore = floatval($results['score']);
        $interpretation = $conn->real_escape_string($results['interpretation']);
        $baseScore = intval($results['baseScore']);
        $avgTimingScore = floatval($results['avgTimingScore']);
        $totalErrors = intval($results['totalErrors']);
        $errorBreakdown = $conn->real_escape_string(json_encode($results['errorBreakdown'] ?? []));
        
        // Insert into arrow_game_results
        $stmt = $conn->prepare("INSERT INTO arrow_game_results 
            (player_name, final_score, interpretation, base_score, avg_timing_score, total_errors, error_breakdown) 
            VALUES (?, ?, ?, ?, ?, ?, ?)");
            
        $stmt->bind_param("sdsidss", 
            $playerName,
            $finalScore,
            $interpretation,
            $baseScore,
            $avgTimingScore,
            $totalErrors,
            $errorBreakdown
        );
        
        $stmt->execute();
        
        // Commit transaction
        $conn->commit();
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Arrow game results saved successfully',
            'resultId' => $conn->insert_id
        ]);
        exit();
    }
    
    // Handle other game types (existing code)
    $nickname = $conn->real_escape_string($data['playerName']);
    $avatar = $conn->real_escape_string($data['playerAvatar'] ?? '👤');
    
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
    
    if ($gameType === 'game1') {
        // Handle Game1 data
        if (!isset($data['ageGroup']) || !isset($data['difficultyTier']) || !isset($data['responses']) || !isset($data['scores'])) {
            throw new Exception('Missing required Game1 data');
        }
        
        // 2. Insert game session for Game1
        $age_group = $conn->real_escape_string($data['ageGroup']);
        $difficulty_tier = $conn->real_escape_string($data['difficultyTier']);
        
        $stmt = $conn->prepare("INSERT INTO game_sessions (player_id, age_group, difficulty_tier, end_time) VALUES (?, ?, ?, NOW())");
        $stmt->bind_param("iss", $player_id, $age_group, $difficulty_tier);
        $stmt->execute();
        $session_id = $conn->insert_id;
        
        // 3. Insert game rounds for Game1
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
        
        // 4. Insert final results for Game1
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
        
        $response_data = [
            'status' => 'success',
            'message' => 'Game1 results saved successfully',
            'sessionId' => $session_id,
            'playerId' => $player_id
        ];
    } 
    elseif ($gameType === 'game3') {
        // Handle Game3 data
        if (!isset($data['forwardTrials']) || !isset($data['backwardTrials'])) {
            throw new Exception('Missing required Game3 data');
        }
        
        // 2. Save forward span trials
        if (!empty($data['forwardTrials'])) {
            $stmt = $conn->prepare("INSERT INTO game3_fwdspan 
                (player_id, span_length, sequence, user_answer, is_correct, response_time_ms)
                VALUES (?, ?, ?, ?, ?, ?)");
            
            foreach ($data['forwardTrials'] as $trial) {
                $isCorrect = $trial['isCorrect'] ? 1 : 0;
                $stmt->bind_param("iissii",
                    $player_id,
                    $trial['spanLength'],
                    $trial['sequence'],
                    $trial['userAnswer'],
                    $isCorrect,
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
                $isCorrect = $trial['isCorrect'] ? 1 : 0;
                $stmt->bind_param("iissii",
                    $player_id,
                    $trial['spanLength'],
                    $trial['sequence'],
                    $trial['userAnswer'],
                    $isCorrect,
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
        
        $response_data = [
            'status' => 'success',
            'message' => 'Game3 results saved successfully',
            'playerId' => $player_id
        ];
    } else {
        throw new Exception('Invalid game type');
    }
    
    // Commit transaction if we got this far
    $conn->commit();
    
    // Return success response
    echo json_encode($response_data);
    
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
