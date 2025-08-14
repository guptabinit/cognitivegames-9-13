<?php
// Test script for saving Game3 data
require_once 'db.php';

// Sample Game3 data
$testData = [
    'gameType' => 'game3',
    'player' => [
        'nickname' => 'Test Player',
        'avatar' => 'avatar1'
    ],
    'forwardTrials' => [
        [
            'spanLength' => 2,
            'sequence' => '6 5',
            'userAnswer' => '65',
            'isCorrect' => true,
            'responseTimeMs' => 4345
        ]
    ],
    'backwardTrials' => [
        [
            'spanLength' => 2,
            'sequence' => '9 2',
            'userAnswer' => '29',
            'isCorrect' => true,
            'responseTimeMs' => 2488
        ]
    ],
    'processingSpeed' => [
        'avgResponseTimeMs' => 3820.5,
        'adjustmentValue' => 0.5
    ],
    'memoryRating' => [
        'forwardSpan' => 2,
        'backwardSpan' => 3,
        'forwardScore' => 1,
        'backwardScore' => 2,
        'speedAdjustment' => 0.5,
        'finalRating' => 1
    ]
];

// Convert to JSON
$jsonData = json_encode($testData);

// Initialize cURL
$ch = curl_init('http://localhost/games/backend/saveResults.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($jsonData)
]);

// Execute and get response
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Output results
echo "HTTP Status: $httpCode\n";
echo "Response: $response\n";

// Check database for the inserted data
if ($httpCode === 200) {
    $playerId = $conn->query("SELECT player_id FROM players WHERE nickname = 'Test Player' LIMIT 1")->fetch_assoc()['player_id'] ?? 0;
    
    if ($playerId) {
        echo "\nData in database for player ID $playerId:\n";
        
        // Check each table
        $tables = [
            'game3_fwdspan',
            'game3_backspan',
            'game3_processspd',
            'game3_memrating'
        ];
        
        foreach ($tables as $table) {
            echo "\nTable: $table\n";
            $result = $conn->query("SELECT * FROM $table WHERE player_id = $playerId");
            if ($result && $result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    print_r($row);
                }
            } else {
                echo "No data found\n";
            }
        }
    } else {
        echo "\nPlayer not found in database\n";
    }
}

$conn->close();
?>
