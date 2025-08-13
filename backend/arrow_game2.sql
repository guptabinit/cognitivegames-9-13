CREATE TABLE IF NOT EXISTS arrow_game_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_name VARCHAR(100) NOT NULL,
    final_score DECIMAL(3,1) NOT NULL,
    interpretation VARCHAR(50) NOT NULL,
    base_score INT NOT NULL,
    avg_timing_score DECIMAL(3,1) NOT NULL,
    total_errors INT NOT NULL,
    error_breakdown TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
