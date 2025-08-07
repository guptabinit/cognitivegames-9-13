<?php
// Allow CORS for development
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set response content type
header("Content-Type: application/json");

include "db.php";

// Decode JSON payload
$data = json_decode(file_get_contents("php://input"), true);

$nickname = $conn->real_escape_string($data['nickname']);
$age = intval($data['age']);

$sql = "INSERT INTO test_users (nickname, age) VALUES ('$nickname', $age)";
if ($conn->query($sql) === TRUE) {
    echo json_encode(["status" => "success", "id" => $conn->insert_id]);
} else {
    echo json_encode(["status" => "error", "message" => $conn->error]);
}
?>