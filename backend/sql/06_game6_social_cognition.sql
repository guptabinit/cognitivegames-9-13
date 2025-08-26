-- Game 6: Social Cognition

-- Stories table
CREATE TABLE IF NOT EXISTS game6_stories (
    story_id INT AUTO_INCREMENT PRIMARY KEY,
    story_type ENUM('emotion', 'strange') NOT NULL,
    story_text TEXT NOT NULL,
    intensity_min INT,
    intensity_max INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comprehension questions table
CREATE TABLE IF NOT EXISTS game6_comprehension (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    story_id INT NOT NULL,
    question_text TEXT NOT NULL,
    options JSON NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (story_id) REFERENCES game6_stories(story_id) ON DELETE CASCADE,
    INDEX idx_g6comp_story (story_id)
);

-- Reasoning questions table
CREATE TABLE IF NOT EXISTS game6_reasoning (
    reasoning_id INT AUTO_INCREMENT PRIMARY KEY,
    story_id INT NOT NULL,
    question_text TEXT NOT NULL,
    options JSON NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    is_inferential BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (story_id) REFERENCES game6_stories(story_id) ON DELETE CASCADE,
    INDEX idx_g6reason_story (story_id)
);

-- Results table
CREATE TABLE IF NOT EXISTS game6_results (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    age_group ENUM('9-10', '11-13') NOT NULL,
    comprehension_raw INT NOT NULL,
    comprehension_score INT NOT NULL,
    intensity_raw INT NOT NULL,
    intensity_score INT NOT NULL,
    reasoning_raw INT NOT NULL,
    reasoning_score INT NOT NULL,
    mentalizing_raw INT NOT NULL,
    mentalizing_score INT NOT NULL,
    final_score FLOAT NOT NULL,
    final_rating VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    INDEX idx_g6results_player (player_id)
);

-- Answers table
CREATE TABLE IF NOT EXISTS game6_answers (
    answer_id INT AUTO_INCREMENT PRIMARY KEY,
    result_id INT NOT NULL,
    story_id INT NOT NULL,
    comprehension_answer VARCHAR(255) NOT NULL,
    intensity_rating INT,
    reasoning_answer VARCHAR(255) NOT NULL,
    is_correct_comprehension BOOLEAN NOT NULL,
    is_correct_reasoning BOOLEAN NOT NULL,
    is_in_range BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (result_id) REFERENCES game6_results(result_id) ON DELETE CASCADE,
    FOREIGN KEY (story_id) REFERENCES game6_stories(story_id) ON DELETE CASCADE,
    INDEX idx_g6answers_result (result_id),
    INDEX idx_g6answers_story (story_id)
);
