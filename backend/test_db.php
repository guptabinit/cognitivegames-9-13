<?php
// Test database connection
require_once 'db.php';

header('Content-Type: application/json');

// Test query
$testQuery = "SHOW TABLES";
$result = $conn->query($testQuery);

if ($result === false) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database query failed',
        'error' => $conn->error,
        'error_no' => $conn->errno
    ]);
    exit();
}

$tables = [];
while ($row = $result->fetch_array()) {
    $tables[] = $row[0];
}

echo json_encode([
    'status' => 'success',
    'tables' => $tables,
    'server_info' => $conn->server_info,
    'host_info' => $conn->host_info
]);

$conn->close();
