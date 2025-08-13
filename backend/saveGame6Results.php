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

    // 2. Save test results
    $age_group = $conn->real_escape_string($data['ageGroup']);
    $scores = $data['scores'];
    
    // Insert main result
    $stmt = $conn->prepare("INSERT INTO game6_results (
        player_id, age_group, 
        comprehension_raw, comprehension_score,
        intensity_raw, intensity_score,
        reasoning_raw, reasoning_score,
        mentalizing_raw, mentalizing_score,
        final_score, final_rating
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->bind_param("isiiiiiiddss",
        $player_id,
        $age_group,
        $scores['comprehension']['raw'],
        $scores['comprehension']['score'],
        $scores['intensity']['raw'],
        $scores['intensity']['score'],
        $scores['reasoning']['raw'],
        $scores['reasoning']['score'],
        $scores['mentalizing']['raw'],
        $scores['mentalizing']['score'],
        $scores['finalScore'],
        $scores['finalRating']
    );
    $stmt->execute();
    $result_id = $conn->insert_id;
    
    // 3. Save individual answers
    $answerStmt = $conn->prepare("INSERT INTO game6_answers (
        result_id, story_id, 
        comprehension_answer, intensity_rating, reasoning_answer,
        is_correct_comprehension, is_correct_reasoning, is_in_range
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    
    foreach ($data['answers'] as $answer) {
        $story_id = $answer['storyId'];
        $compAnswer = $conn->real_escape_string($answer['comprehension']);
        $intensity = isset($answer['intensity']) ? (int)$answer['intensity'] : null;
        $reasoning = $conn->real_escape_string($answer['reasoning']);
        $isCorrectComp = $answer['isCorrectComprehension'] ? 1 : 0;
        $isCorrectReasoning = $answer['isCorrectReasoning'] ? 1 : 0;
        $isInRange = isset($answer['isInRange']) ? ($answer['isInRange'] ? 1 : 0) : null;
        
        $answerStmt->bind_param("iissiii", 
            $result_id, 
            $story_id,
            $compAnswer,
            $intensity,
            $reasoning,
            $isCorrectComp,
            $isCorrectReasoning,
            $isInRange
        );
        $answerStmt->execute();
    }
    
    // 4. Insert initial stories if they don't exist
    $stmt = $conn->query("SELECT COUNT(*) as count FROM game6_stories");
    $result = $stmt->fetch_assoc();
    
    if ($result['count'] == 0) {
        // Insert stories from the Game6.jsx file
        $stories = [
            // Emotion Story 1
            [
                'type' => 'emotion',
                'text' => "Sarah practiced for weeks for the piano recital. When she got on stage, she saw how many people were in the audience and her hands started to shake. She was worried she would forget the notes.",
                'intensity_min' => 3,
                'intensity_max' => 5,
                'comprehension' => [
                    'question' => "What was Sarah worried about?",
                    'options' => ["The audience being too loud", "Forgetting the notes", "The piano being out of tune"],
                    'answer' => "Forgetting the notes"
                ],
                'reasoning' => [
                    'question' => "Why were Sarah's hands shaking?",
                    'options' => ["She was cold", "She was nervous about performing", "She hadn't practiced enough"],
                    'answer' => "She was nervous about performing",
                    'is_inferential' => true
                ]
            ],
            // Add more stories here...
        ];

        foreach ($stories as $story) {
            // Insert story
            $stmt = $conn->prepare("INSERT INTO game6_stories (story_type, story_text, intensity_min, intensity_max) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssii", 
                $story['type'], 
                $story['text'], 
                $story['intensity_min'] ?? null, 
                $story['intensity_max'] ?? null
            );
            $stmt->execute();
            $story_id = $conn->insert_id;

            // Insert comprehension question
            $comp = $story['comprehension'];
            $optionsJson = json_encode($comp['options']);
            $stmt = $conn->prepare("INSERT INTO game6_comprehension (story_id, question_text, options, correct_answer) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("isss", $story_id, $comp['question'], $optionsJson, $comp['answer']);
            $stmt->execute();

            // Insert reasoning question
            $reason = $story['reasoning'];
            $reasonOptionsJson = json_encode($reason['options']);
            $isInferential = $reason['is_inferential'] ? 1 : 0;
            $stmt = $conn->prepare("INSERT INTO game6_reasoning (story_id, question_text, options, correct_answer, is_inferential) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param("isssi", $story_id, $reason['question'], $reasonOptionsJson, $reason['answer'], $isInferential);
            $stmt->execute();
        }
    }

    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Game6 results saved successfully',
        'resultId' => $result_id
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to save results: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}

$conn->close();
?>
