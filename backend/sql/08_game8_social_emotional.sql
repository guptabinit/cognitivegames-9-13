-- Game 8: Social and Emotional Context Challenge

-- Results table
CREATE TABLE IF NOT EXISTS game8_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    perspective_score INT NOT NULL,
    perspective_rating VARCHAR(20) NOT NULL,
    social_factor_score INT NOT NULL,
    social_factor_rating VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    INDEX idx_game8_player (player_id)
);
