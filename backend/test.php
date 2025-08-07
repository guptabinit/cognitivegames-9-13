<?php
// Enable CORS for development
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Set response content type
header("Content-Type: application/json");

// Simple test response
echo json_encode([
    'status' => 'success',
    'message' => 'Backend is working!',
    'server_time' => date('Y-m-d H:i:s')
]);
?>
