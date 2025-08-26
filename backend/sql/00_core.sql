-- Core Database Tables --

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

-- Create indexes for better query performance
CREATE INDEX idx_sessions_player ON game_sessions(player_id);
