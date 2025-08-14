<?php
// Enable CORS for development
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

echo json_encode([
    'status' => 'success',
    'message' => 'Test endpoint is working!',
    'server_time' => date('Y-m-d H:i:s')
]);
