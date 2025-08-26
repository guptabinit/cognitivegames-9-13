-- Game 10: Delayed Gratification Test

-- Results table
CREATE TABLE IF NOT EXISTS game10_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    age_group VARCHAR(10) NOT NULL,
    choice VARCHAR(20) NOT NULL,
    wait_duration INT NOT NULL,
    reasoning TEXT,
    raw_score FLOAT NOT NULL,
    likert_score INT NOT NULL,
    interpretation VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    INDEX idx_game10_player (player_id)
);
