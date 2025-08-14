<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

$response = [
    'status' => 'success',
    'tables' => []
];

try {
    // Get list of all tables
    $result = $conn->query("SHOW TABLES");
    if ($result) {
        while ($row = $result->fetch_array()) {
            $tableName = $row[0];
            $tableInfo = [
                'name' => $tableName,
                'columns' => []
            ];
            
            // Get column info
            $columns = $conn->query("SHOW COLUMNS FROM `$tableName`");
            if ($columns) {
                while ($col = $columns->fetch_assoc()) {
                    $tableInfo['columns'][] = $col;
                }
            }
            
            // Get row count
            $count = $conn->query("SELECT COUNT(*) as count FROM `$tableName`")->fetch_assoc();
            $tableInfo['row_count'] = (int)$count['count'];
            
            $response['tables'][] = $tableInfo;
        }
    } else {
        throw new Exception("Failed to fetch tables: " . $conn->error);
    }
} catch (Exception $e) {
    $response = [
        'status' => 'error',
        'message' => $e->getMessage()
    ];
    http_response_code(500);
}

echo json_encode($response, JSON_PRETTY_PRINT);
