-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS cognitive_game;

USE cognitive_game;

-- Players table to store user information
CREATE TABLE IF NOT EXISTS players (
    player_id INT AUTO_INCREMENT PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL,
    avatar VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT,
    age_group ENUM('9-10', '11-13') NOT NULL,
    difficulty_tier VARCHAR(20) NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE
);

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
CREATE INDEX idx_sessions_player ON game_sessions(player_id);
CREATE INDEX idx_rounds_session ON game_rounds(session_id);
CREATE INDEX idx_results_session ON game_results(session_id);

-- Game3 Forward Span table
CREATE TABLE IF NOT EXISTS game3_fwdspan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    span_length INT NOT NULL,
    sequence VARCHAR(50) NOT NULL,
    user_answer VARCHAR(50) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time_ms INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    INDEX idx_fwdspan_player (player_id)
);

-- Game3 Backward Span table
CREATE TABLE IF NOT EXISTS game3_backspan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    span_length INT NOT NULL,
    sequence VARCHAR(50) NOT NULL,
    user_answer VARCHAR(50) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time_ms INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    INDEX idx_backspan_player (player_id)
);

-- Game3 Processing Speed table
CREATE TABLE IF NOT EXISTS game3_processspd (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    avg_response_time_ms FLOAT NOT NULL,
    adjustment_value FLOAT NOT NULL,
    test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    INDEX idx_processspd_player (player_id)
);

-- Game3 Memory Rating table
CREATE TABLE IF NOT EXISTS game3_memrating (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    forward_span INT NOT NULL,
    backward_span INT NOT NULL,
    forward_score INT NOT NULL,
    backward_score INT NOT NULL,
    speed_adjustment FLOAT NOT NULL,
    final_rating INT NOT NULL,
    test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    INDEX idx_memrating_player (player_id)
);
