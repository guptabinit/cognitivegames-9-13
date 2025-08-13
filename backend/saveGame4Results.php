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

    // 2. Save story results
    if (!empty($data['storyResults'])) {
        $stmt = $conn->prepare("INSERT INTO game4_results 
            (player_id, story_id, recall_score, recall_percentage, 
             comprehension_score, comprehension_quality, processing_time, 
             speed_efficiency, final_rating)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        foreach ($data['storyResults'] as $result) {
            $stmt->bind_param("iiidssdsd",
                $player_id,
                $result['storyId'],
                $result['recall']['score'],
                $result['recall']['percentage'],
                $result['comprehension']['percentage'],
                $result['comprehension']['quality'],
                $result['speed']['time'],
                $result['speed']['efficiency'],
                $result['finalRating']
            );
            $stmt->execute();
        }
    }

    // 3. Insert initial stories if they don't exist
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM game4_stories");
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    
    if ($result['count'] == 0) {
        // Insert stories from the Game4.jsx file
        $stories = [
            // 9-10 Age Group
            [
                'age_group' => '9-10',
                'level' => 1,
                'text' => "The school library is getting new books next week. The librarian said there will be 15 new storybooks about animals and 10 new picture books. The books will be on the blue shelf near the window.",
                'key_details' => [
                    "15 new storybooks about animals",
                    "10 new picture books",
                    "Books will be on the blue shelf near the window",
                    "Books arriving next week"
                ],
                'questions' => [
                    [
                        'question' => "Where will the new books be placed?",
                        'options' => ["On the red shelf", "On the blue shelf near the window", "On the teacher's desk", "In the reading corner"],
                        'answer' => "On the blue shelf near the window"
                    ],
                    [
                        'question' => "How many new picture books are coming?",
                        'options' => ["5", "10", "15", "20"],
                        'answer' => "10"
                    ]
                ]
            ],
            // Add more stories here...
        ];

        foreach ($stories as $story) {
            // Insert story
            $stmt = $conn->prepare("INSERT INTO game4_stories (age_group, level, text) VALUES (?, ?, ?)");
            $stmt->bind_param("sis", $story['age_group'], $story['level'], $story['text']);
            $stmt->execute();
            $story_id = $conn->insert_id;

            // Insert key details
            $detailStmt = $conn->prepare("INSERT INTO game4_keydetails (story_id, detail_text) VALUES (?, ?)");
            foreach ($story['key_details'] as $detail) {
                $detailStmt->bind_param("is", $story_id, $detail);
                $detailStmt->execute();
            }

            // Insert comprehension questions
            $qStmt = $conn->prepare("INSERT INTO game4_comprehension (story_id, question_text, options, correct_answer) VALUES (?, ?, ?, ?)");
            foreach ($story['questions'] as $question) {
                $optionsJson = json_encode($question['options']);
                $qStmt->bind_param("isss", $story_id, $question['question'], $optionsJson, $question['answer']);
                $qStmt->execute();
            }
        }
    }

    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Game4 results saved successfully',
        'playerId' => $player_id
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to save results: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
