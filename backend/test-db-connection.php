<?php
// Test database connection
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once 'db.php';

$testQuery = "SELECT 1 as test";
$result = $conn->query($testQuery);

if ($result) {
    echo json_encode([
        'status' => 'success',
        'message' => 'Database connection successful!',
        'mysql_version' => $conn->server_version,
        'db_name' => 'cognitive_game'
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database query failed',
        'error' => $conn->error
    ]);
}

$conn->close();
?>
