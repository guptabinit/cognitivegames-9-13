-- Game 9: Cognitive Assessment

-- Go/No-Go test table
CREATE TABLE IF NOT EXISTS game9_go_nogo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    go_accuracy FLOAT NOT NULL,
    nogo_accuracy FLOAT NOT NULL,
    commission_errors INT NOT NULL,
    omission_errors INT NOT NULL,
    avg_go_rt FLOAT NOT NULL,
    subscore INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    INDEX idx_go_nogo_player (player_id)
);

-- Stroop test table
CREATE TABLE IF NOT EXISTS game9_stroop (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    congruent_accuracy FLOAT NOT NULL,
    incongruent_accuracy FLOAT NOT NULL,
    avg_congruent_rt FLOAT NOT NULL,
    avg_incongruent_rt FLOAT NOT NULL,
    accuracy_cost FLOAT NOT NULL,
    rt_cost FLOAT NOT NULL,
    congruent_subscore INT NOT NULL,
    incongruent_subscore INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    INDEX idx_stroop_player (player_id)
);

-- Flanker test table
CREATE TABLE IF NOT EXISTS game9_flanker (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    congruent_accuracy FLOAT NOT NULL,
    incongruent_accuracy FLOAT NOT NULL,
    avg_congruent_rt FLOAT NOT NULL,
    avg_incongruent_rt FLOAT NOT NULL,
    accuracy_cost FLOAT NOT NULL,
    rt_cost FLOAT NOT NULL,
    congruent_subscore INT NOT NULL,
    incongruent_subscore INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    INDEX idx_flanker_player (player_id)
);

-- Game 9 results table
CREATE TABLE IF NOT EXISTS game9_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    task_type ENUM('go_nogo', 'stroop', 'flanker') NOT NULL,
    overall_score FLOAT NOT NULL,
    descriptor VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    INDEX idx_game9_results_player (player_id, task_type)
);
