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
    // 1. First, ensure all required tables exist
    $tables = ['game4_stories', 'game4_keydetails', 'game4_comprehension', 'game4_results'];
    foreach ($tables as $table) {
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        if ($result->num_rows == 0) {
            // Initialize tables if they don't exist
            require_once 'init_game4_tables.php';
            break;
        }
    }

    // 2. Insert or get player
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

    // 3. Ensure we have stories in the database
    $stmt = $conn->query("SELECT COUNT(*) as count FROM game4_stories");
    $storyCount = $stmt->fetch_assoc()['count'];
    
    if ($storyCount == 0) {
        // If no stories exist, try to initialize them
        require_once 'init_game4_tables.php';
    }

    // 4. Save story results if any
    if (!empty($data['storyResults'])) {
        $stmt = $conn->prepare("INSERT INTO game4_results 
            (player_id, story_id, recall_score, recall_percentage, 
             comprehension_score, comprehension_quality, processing_time, 
             speed_efficiency, final_rating)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            recall_score = VALUES(recall_score),
            recall_percentage = VALUES(recall_percentage),
            comprehension_score = VALUES(comprehension_score),
            comprehension_quality = VALUES(comprehension_quality),
            processing_time = VALUES(processing_time),
            speed_efficiency = VALUES(speed_efficiency),
            final_rating = VALUES(final_rating)");
        
        foreach ($data['storyResults'] as $result) {
            // Verify story exists
            $checkStmt = $conn->prepare("SELECT story_id FROM game4_stories WHERE story_id = ?");
            $checkStmt->bind_param("i", $result['storyId']);
            $checkStmt->execute();
            
            if ($checkStmt->get_result()->num_rows === 0) {
                error_log("Story ID " . $result['storyId'] . " not found, skipping");
                continue; // Skip this result if story doesn't exist
            }
            
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
            
            if (!$stmt->execute()) {
                error_log("Error saving story result: " . $stmt->error);
                throw new Exception("Failed to save story result: " . $stmt->error);
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
    if (isset($conn) && $conn) {
        $conn->rollback();
    }
    
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to save results: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}

if (isset($conn) && $conn) {
    $conn->close();
}
?>
