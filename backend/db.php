<?php
// backend/db.php
$host = "localhost";
$user = "root";
$password = ""; // change if needed
$dbname = "cognitive_game";

// Log database connection attempt
file_put_contents('db_connection.log', "[" . date('Y-m-d H:i:s') . "] Attempting to connect to database...\n", FILE_APPEND);

$conn = new mysqli($host, $user, $password, $dbname);

if ($conn->connect_error) {
    $error = "Database connection failed: " . $conn->connect_error;
    file_put_contents('db_connection.log', "[" . date('Y-m-d H:i:s') . "] $error\n", FILE_APPEND);
    die(json_encode(['status' => 'error', 'message' => $error]));
} else {
    file_put_contents('db_connection.log', "[" . date('Y-m-d H:i:s') . "] Successfully connected to database\n", FILE_APPEND);
}

// Set charset to ensure proper encoding
if (!$conn->set_charset("utf8mb4")) {
    $error = "Error loading character set utf8mb4: " . $conn->error;
    file_put_contents('db_connection.log', "[" . date('Y-m-d H:i:s') . "] $error\n", FILE_APPEND);
}

// Function to log database errors
function logDbError($message, $conn) {
    $error = $message . ": " . $conn->error;
    file_put_contents('db_errors.log', "[" . date('Y-m-d H:i:s') . "] $error\n", FILE_APPEND);
    return $error;
}
?>
