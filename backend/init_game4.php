<?php
require_once 'db.php';

header('Content-Type: application/json');

function initializeGame4Tables($conn) {
    try {
        // Create game4_stories table if it doesn't exist
        $conn->query("CREATE TABLE IF NOT EXISTS game4_stories (
            story_id INT AUTO_INCREMENT PRIMARY KEY,
            age_group ENUM('9-10', '11-13') NOT NULL,
            level INT NOT NULL,
            text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_story (age_group, level)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        // Create game4_keydetails table
        $conn->query("CREATE TABLE IF NOT EXISTS game4_keydetails (
            detail_id INT AUTO_INCREMENT PRIMARY KEY,
            story_id INT NOT NULL,
            detail_text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (story_id) REFERENCES game4_stories(story_id) ON DELETE CASCADE,
            INDEX idx_keydetails_story (story_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        // Create game4_comprehension table
        $conn->query("CREATE TABLE IF NOT EXISTS game4_comprehension (
            question_id INT AUTO_INCREMENT PRIMARY KEY,
            story_id INT NOT NULL,
            question_text TEXT NOT NULL,
            options JSON NOT NULL,
            correct_answer VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (story_id) REFERENCES game4_stories(story_id) ON DELETE CASCADE,
            INDEX idx_comprehension_story (story_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        // Create game4_results table
        $conn->query("CREATE TABLE IF NOT EXISTS game4_results (
            result_id INT AUTO_INCREMENT PRIMARY KEY,
            player_id INT NOT NULL,
            story_id INT NOT NULL,
            recall_score INT NOT NULL,
            recall_percentage FLOAT NOT NULL,
            comprehension_score FLOAT NOT NULL,
            comprehension_quality VARCHAR(20) NOT NULL,
            processing_time FLOAT NOT NULL,
            speed_efficiency VARCHAR(20) NOT NULL,
            final_rating FLOAT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
            FOREIGN KEY (story_id) REFERENCES game4_stories(story_id) ON DELETE CASCADE,
            INDEX idx_g4results_player (player_id),
            INDEX idx_g4results_story (story_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        return true;
    } catch (Exception $e) {
        error_log("Error initializing Game 4 tables: " . $e->getMessage());
        return false;
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
        // 11-13 Age Group - Level 1
        [
            'age_group' => '11-13',
            'level' => 1,
            'text' => "The science fair is scheduled for next Friday in the school gymnasium. Participants must arrive by 8:30 AM to set up their projects. The judging will begin promptly at 9:15 AM, and winners will be announced at 2:00 PM. All projects must follow the safety guidelines posted on the school website.",
            'key_details' => [
                "Science fair is next Friday",
                "Location: school gymnasium",
                "Participants arrive by 8:30 AM",
                "Judging starts at 9:15 AM",
                "Winners announced at 2:00 PM",
                "Safety guidelines on school website"
            ],
            'questions' => [
                [
                    'question' => "What time does judging begin?",
                    'options' => ["8:30 AM", "9:00 AM", "9:15 AM", "2:00 PM"],
                    'answer' => "9:15 AM"
                ],
                [
                    'question' => "Where can participants find the safety guidelines?",
                    'options' => ["In the main office", "On the school website", "From their teacher", "In the gymnasium"],
                    'answer' => "On the school website"
                ]
            ]
        ]
    ];

    try {
        $conn->begin_transaction();

        $storyStmt = $conn->prepare("INSERT IGNORE INTO game4_stories (age_group, level, text) VALUES (?, ?, ?)");
        $detailStmt = $conn->prepare("INSERT IGNORE INTO game4_keydetails (story_id, detail_text) VALUES (?, ?)");
        $questionStmt = $conn->prepare("INSERT IGNORE INTO game4_comprehension (story_id, question_text, options, correct_answer) VALUES (?, ?, ?, ?)");

        foreach ($defaultStories as $story) {
            // Insert story
            $storyStmt->bind_param("sis", $story['age_group'], $story['level'], $story['text']);
            $storyStmt->execute();
            
            if ($storyStmt->affected_rows > 0) {
                $storyId = $conn->insert_id;
                
                // Insert key details
                foreach ($story['key_details'] as $detail) {
                    $detailStmt->bind_param("is", $storyId, $detail);
                    $detailStmt->execute();
                }

                // Insert questions
                foreach ($story['questions'] as $question) {
                    $optionsJson = json_encode($question['options']);
                    $questionStmt->bind_param("isss", $storyId, $question['question'], $optionsJson, $question['answer']);
                    $questionStmt->execute();
                }
            }
        }

        $conn->commit();
        return true;
    } catch (Exception $e) {
        $conn->rollback();
        error_log("Error inserting default stories: " . $e->getMessage());
        return false;
    }
}

// Handle the request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Initialize tables
        if (!initializeGame4Tables($conn)) {
            throw new Exception("Failed to initialize Game 4 tables");
        }

        // Insert default stories
        if (!insertDefaultStories($conn)) {
            throw new Exception("Failed to insert default stories");
        }

        // Verify the data was inserted
        $result = $conn->query("SELECT COUNT(*) as count FROM game4_stories");
        $count = $result->fetch_assoc()['count'];

        echo json_encode([
            'status' => 'success',
            'message' => 'Game 4 initialized successfully',
            'stories_initialized' => $count
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
}

$conn->close();
?>
