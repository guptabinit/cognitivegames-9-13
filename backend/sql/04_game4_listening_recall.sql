-- Game 4: Listening Recall

-- Stories table
CREATE TABLE IF NOT EXISTS game4_stories (
    story_id INT AUTO_INCREMENT PRIMARY KEY,
    age_group ENUM('9-10', '11-13') NOT NULL,
    level INT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_story (age_group, level)
);

-- Key details table
CREATE TABLE IF NOT EXISTS game4_keydetails (
    detail_id INT AUTO_INCREMENT PRIMARY KEY,
    story_id INT NOT NULL,
    detail_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (story_id) REFERENCES game4_stories(story_id) ON DELETE CASCADE,
    INDEX idx_keydetails_story (story_id)
);

-- Comprehension questions table
CREATE TABLE IF NOT EXISTS game4_comprehension (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    story_id INT NOT NULL,
    question_text TEXT NOT NULL,
    options JSON NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (story_id) REFERENCES game4_stories(story_id) ON DELETE CASCADE,
    INDEX idx_comprehension_story (story_id)
);

-- Results table
CREATE TABLE IF NOT EXISTS game4_results (
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
);
