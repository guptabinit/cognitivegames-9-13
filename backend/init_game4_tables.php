<?php
require_once 'db.php';

header('Content-Type: application/json');

function createGame4Tables($conn) {
    $queries = [
        "CREATE TABLE IF NOT EXISTS game4_stories (
            story_id INT AUTO_INCREMENT PRIMARY KEY,
            age_group ENUM('9-10', '11-13') NOT NULL,
            level INT NOT NULL,
            text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_story (age_group, level)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"
        ,
        "CREATE TABLE IF NOT EXISTS game4_keydetails (
            detail_id INT AUTO_INCREMENT PRIMARY KEY,
            story_id INT NOT NULL,
            detail_text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (story_id) REFERENCES game4_stories(story_id) ON DELETE CASCADE,
            INDEX idx_keydetails_story (story_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"
        ,
        "CREATE TABLE IF NOT EXISTS game4_comprehension (
            question_id INT AUTO_INCREMENT PRIMARY KEY,
            story_id INT NOT NULL,
            question_text TEXT NOT NULL,
            options JSON NOT NULL,
            correct_answer VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (story_id) REFERENCES game4_stories(story_id) ON DELETE CASCADE,
            INDEX idx_comprehension_story (story_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"
    ];

    $conn->begin_transaction();
    try {
        foreach ($queries as $query) {
            if (!$conn->query($query)) {
                throw new Exception("Query failed: " . $conn->error);
            }
        }
        $conn->commit();
        return ['status' => 'success', 'message' => 'Game4 tables created successfully'];
    } catch (Exception $e) {
        $conn->rollback();
        return ['status' => 'error', 'message' => $e->getMessage()];
    }
}

function insertDefaultStories($conn) {
    $defaultStories = [
        // 9-10 Age Group - Level 1
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
        // Add more default stories as needed
    ];

    $conn->begin_transaction();
    try {
        $storyStmt = $conn->prepare("INSERT IGNORE INTO game4_stories (age_group, level, text) VALUES (?, ?, ?)");
        $detailStmt = $conn->prepare("INSERT IGNORE INTO game4_keydetails (story_id, detail_text) VALUES (?, ?)");
        $questionStmt = $conn->prepare("INSERT IGNORE INTO game4_comprehension (story_id, question_text, options, correct_answer) VALUES (?, ?, ?, ?)");

        foreach ($defaultStories as $story) {
            // Insert story
            $storyStmt->bind_param("sis", $story['age_group'], $story['level'], $story['text']);
            if (!$storyStmt->execute()) {
                throw new Exception("Failed to insert story: " . $storyStmt->error);
            }
            
            if ($storyStmt->affected_rows > 0) {
                $storyId = $conn->insert_id;
                
                // Insert key details
                foreach ($story['key_details'] as $detail) {
                    $detailStmt->bind_param("is", $storyId, $detail);
                    if (!$detailStmt->execute()) {
                        throw new Exception("Failed to insert detail: " . $detailStmt->error);
                    }
                }

                // Insert questions
                foreach ($story['questions'] as $question) {
                    $optionsJson = json_encode($question['options']);
                    $questionStmt->bind_param("isss", $storyId, $question['question'], $optionsJson, $question['answer']);
                    if (!$questionStmt->execute()) {
                        throw new Exception("Failed to insert question: " . $questionStmt->error);
                    }
                }
            }
        }
        
        $conn->commit();
        return ['status' => 'success', 'message' => 'Default stories inserted successfully'];
    } catch (Exception $e) {
        $conn->rollback();
        return ['status' => 'error', 'message' => $e->getMessage()];
    }
}

// Handle the request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Create tables if they don't exist
    $result = createGame4Tables($conn);
    
    if ($result['status'] === 'success') {
        // Insert default stories if they don't exist
        $result = insertDefaultStories($conn);
    }
    
    echo json_encode($result);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}

$conn->close();
?>
