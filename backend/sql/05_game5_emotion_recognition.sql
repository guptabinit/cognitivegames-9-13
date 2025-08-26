-- Game 5: Emotion Recognition

-- Emotion responses table
CREATE TABLE IF NOT EXISTS game5_emotion_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    question_id INT NOT NULL,
    correct_emotion VARCHAR(20) NOT NULL,
    selected_emotion VARCHAR(20) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time_ms INT NOT NULL,
    intensity VARCHAR(10) NOT NULL,
    age_group VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    INDEX idx_emotion_player (player_id)
);
