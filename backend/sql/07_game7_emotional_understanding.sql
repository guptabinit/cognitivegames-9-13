-- Game 7: Emotional Understanding Test

-- Vignettes table to store the emotional scenarios
CREATE TABLE IF NOT EXISTS game7_vignettes (
    vignette_id INT AUTO_INCREMENT PRIMARY KEY,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions for each vignette and age group
CREATE TABLE IF NOT EXISTS game7_questions (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    vignette_id INT NOT NULL,
    age_group ENUM('9-10', '11-13') NOT NULL,
    question_type ENUM('feeling', 'helpful', 'cope', 'kindness') NOT NULL,
    question_text TEXT NOT NULL,
    options JSON NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vignette_id) REFERENCES game7_vignettes(vignette_id) ON DELETE CASCADE,
    INDEX idx_questions_vignette (vignette_id, age_group)
);

-- Keywords for short answer scoring
CREATE TABLE IF NOT EXISTS game7_keywords (
    keyword_id INT AUTO_INCREMENT PRIMARY KEY,
    vignette_id INT NOT NULL,
    keyword_type ENUM('twoPoints', 'onePoint') NOT NULL,
    keyword VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vignette_id) REFERENCES game7_vignettes(vignette_id) ON DELETE CASCADE,
    INDEX idx_keywords_vignette (vignette_id)
);

-- User responses to vignettes
CREATE TABLE IF NOT EXISTS game7_responses (
    response_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT,
    player_id INT NOT NULL,
    vignette_id INT NOT NULL,
    feeling_answer VARCHAR(255),
    helpful_answer VARCHAR(255),
    cope_answer VARCHAR(255),
    kindness_answer VARCHAR(255),
    short_answer TEXT,
    time_spent_seconds FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES game_sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (vignette_id) REFERENCES game7_vignettes(vignette_id) ON DELETE CASCADE,
    INDEX idx_responses_player (player_id),
    INDEX idx_responses_session (session_id)
);

-- Final test results
CREATE TABLE IF NOT EXISTS game7_results (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT,
    player_id INT NOT NULL,
    age_group ENUM('9-10', '11-13') NOT NULL,
    mcq_score INT NOT NULL,
    short_answer_score INT NOT NULL,
    total_score INT NOT NULL,
    likert_score INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES game_sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    INDEX idx_results_player (player_id),
    INDEX idx_results_session (session_id)
);
