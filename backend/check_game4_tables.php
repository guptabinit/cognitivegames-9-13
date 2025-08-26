<?php
require_once 'db.php';

header('Content-Type: application/json');

// Check if tables exist and get their structure
$tables = ['game4_stories', 'game4_keydetails', 'game4_comprehension', 'game4_results'];
$results = [];

foreach ($tables as $table) {
    $result = $conn->query("SHOW CREATE TABLE `$table`");
    if ($result) {
        $row = $result->fetch_assoc();
        $results[$table] = [
            'status' => 'exists',
            'row_count' => $conn->query("SELECT COUNT(*) as count FROM `$table`")->fetch_assoc()['count']
        ];
        
        // Get sample data for non-empty tables
        if ($results[$table]['row_count'] > 0) {
            $sample = $conn->query("SELECT * FROM `$table` LIMIT 1")->fetch_assoc();
            $results[$table]['sample'] = $sample;
        }
    } else {
        $results[$table] = ['status' => 'missing', 'error' => $conn->error];
    }
}

echo json_encode($results, JSON_PRETTY_PRINT);
?>
