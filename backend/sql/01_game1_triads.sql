-- Game 1: Triads Game

-- Game rounds table to store each triad attempt
CREATE TABLE IF NOT EXISTS game_rounds (
    round_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT,
    triad_id VARCHAR(50) NOT NULL,
    word1 VARCHAR(50) NOT NULL,
    word2 VARCHAR(50) NOT NULL,
    word3 VARCHAR(50) NOT NULL,
    correct_word VARCHAR(50) NOT NULL,
    user_answer VARCHAR(50) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_taken FLOAT NOT NULL,
    choice_changes INT NOT NULL DEFAULT 0,
    error_type ENUM('close_meaning', 'random') NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES game_sessions(session_id) ON DELETE CASCADE
);

-- Game results table for the final scores
CREATE TABLE IF NOT EXISTS game_results (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT,
    accuracy_score INT NOT NULL,
    accuracy_value VARCHAR(20) NOT NULL,
    reasoning_score INT NOT NULL,
    reasoning_value VARCHAR(20) NOT NULL,
    speed_score INT NOT NULL,
    speed_value VARCHAR(20) NOT NULL,
    error_pattern_score INT NOT NULL,
    error_pattern_value VARCHAR(50) NOT NULL,
    overall_score INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES game_sessions(session_id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_rounds_session ON game_rounds(session_id);
CREATE INDEX idx_results_session ON game_results(session_id);
