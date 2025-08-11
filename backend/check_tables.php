<?php
require_once 'db.php';

header('Content-Type: application/json');

// Function to get table structure
function getTableStructure($conn, $tableName) {
    $result = $conn->query("SHOW CREATE TABLE `$tableName`");
    if ($result && $row = $result->fetch_assoc()) {
        return [
            'table' => $tableName,
            'structure' => $row['Create Table']
        ];
    }
    return [
        'table' => $tableName,
        'error' => $conn->error
    ];
}

// List of Game3 tables to check
$tables = [
    'game3_fwdspan',
    'game3_backspan',
    'game3_processspd',
    'game3_memrating'
];

$results = [];
foreach ($tables as $table) {
    $results[] = getTableStructure($conn, $table);
}

echo json_encode($results, JSON_PRETTY_PRINT);
?>
