-- Game 3: Memory Span

-- Forward Span table
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

-- Backward Span table
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

-- Processing Speed table
CREATE TABLE IF NOT EXISTS game3_processspd (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    avg_response_time_ms FLOAT NOT NULL,
    adjustment_value FLOAT NOT NULL,
    test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    INDEX idx_processspd_player (player_id)
);

-- Memory Rating table
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
