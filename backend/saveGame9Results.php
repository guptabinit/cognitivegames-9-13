<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set JSON content type and CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

// Log request details
function logRequest($data) {
    $logData = [
        'timestamp' => date('Y-m-d H:i:s'),
        'method' => $_SERVER['REQUEST_METHOD'],
        'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'not set',
        'data' => $data
    ];
    file_put_contents('request_log.log', json_encode($logData) . "\n", FILE_APPEND);
}

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include database connection
require_once 'db.php';

// Log database connection status
if ($conn->connect_error) {
    $error = "Database connection failed: " . $conn->connect_error;
    error_log($error);
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit();
}

// Get raw input
$json = file_get_contents('php://input');
if ($json === false) {
    $error = 'Failed to read input data';
    error_log($error);
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $error
    ]);
    exit();
}

// Decode JSON
$data = json_decode(trim($json), true);

// Log the raw input for debugging (without sensitive data)
$logData = [
    'request_method' => $_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN',
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'not set',
    'input_length' => strlen($json),
    'json_error' => json_last_error() !== JSON_ERROR_NONE ? json_last_error_msg() : null
];

error_log('Received request: ' . print_r($logData, true));

// Check for JSON decode errors
if (json_last_error() !== JSON_ERROR_NONE) {
    $error = 'JSON decode error: ' . json_last_error_msg();
    error_log($error . ' | Input: ' . substr($json, 0, 500)); // Log first 500 chars of input
    
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid JSON data',
        'error' => json_last_error_msg(),
        'input_sample' => substr($json, 0, 100) // Only return first 100 chars of input
    ]);
    exit();
}

// Validate required fields structure
$requiredFields = [
    'player' => ['nickname'],
    'taskType' => null,
    'results' => null,
    'overallScore' => null,
    'descriptor' => null
];

$missing = [];
foreach ($requiredFields as $field => $subFields) {
    if (!isset($data[$field])) {
        $missing[] = $field;
    } elseif (is_array($subFields) && is_array($data[$field])) {
        // Check nested required fields
        foreach ($subFields as $subField) {
            if (!isset($data[$field][$subField])) {
                $missing[] = "$field.$subField";
            }
        }
    }
}

if (!empty($missing)) {
    $error = 'Missing required fields: ' . implode(', ', $missing);
    error_log($error);
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $error,
        'required_fields' => ['player', 'taskType', 'results'],
        'received' => array_keys($data)
    ]);
    exit();
}

// Start transaction
$conn->begin_transaction();

// Log start of transaction
error_log('Starting database transaction');

try {
    // 1. Insert or get player
    if (!isset($data['player']['nickname'])) {
        $error = 'Player nickname is required';
        error_log($error);
        throw new Exception($error);
    }
    
    $nickname = $conn->real_escape_string($data['player']['nickname']);
    $avatar = $conn->real_escape_string($data['player']['avatar'] ?? 'default');
    
    error_log("Processing player: " . $nickname . " (avatar: " . $avatar . ")");
    
    // Check if player exists
    $query = "SELECT player_id FROM players WHERE nickname = ?";
    error_log("Preparing query: " . $query);
    
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        $error = 'Prepare failed: ' . $conn->error . ' | Error No: ' . $conn->errno;
        error_log($error);
        throw new Exception('Database error while preparing player lookup');
    }
    
    error_log("Binding params: " . print_r([$nickname], true));
    $bindResult = $stmt->bind_param("s", $nickname);
    if ($bindResult === false) {
        $error = 'Bind param failed: ' . $stmt->error . ' | Error No: ' . $stmt->errno;
        error_log($error);
        throw new Exception('Database error while binding player parameters');
    }
    
    error_log("Executing player lookup query");
    $executeResult = $stmt->execute();
    if ($executeResult === false) {
        $error = 'Execute failed: ' . $stmt->error . ' | Error No: ' . $stmt->errno;
        error_log($error);
        throw new Exception('Database error while executing player lookup');
    }
    
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $player = $result->fetch_assoc();
        $player_id = $player['player_id'];
        error_log("Found existing player with ID: " . $player_id);
    } else {
        // Insert new player
        $query = "INSERT INTO players (nickname, avatar) VALUES (?, ?)";
        error_log("Preparing query: " . $query);
        
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            $error = 'Prepare failed: ' . $conn->error . ' | Error No: ' . $conn->errno;
            error_log($error);
            throw new Exception('Database error while preparing player insert');
        }
        
        error_log("Binding params: " . print_r([$nickname, $avatar], true));
        $bindResult = $stmt->bind_param("ss", $nickname, $avatar);
        if ($bindResult === false) {
            $error = 'Bind param failed: ' . $stmt->error . ' | Error No: ' . $stmt->errno;
            error_log($error);
            throw new Exception('Database error while binding player insert parameters');
        }
        
        error_log("Executing player insert query");
        $executeResult = $stmt->execute();
        if ($executeResult === false) {
            $error = 'Execute failed: ' . $stmt->error . ' | Error No: ' . $stmt->errno;
            error_log($error);
            
            // Check for duplicate entry error
            if ($stmt->errno == 1062) { // MySQL duplicate entry error code
                error_log("Duplicate player detected, attempting to fetch existing player");
                // Try to get the existing player
                $existingStmt = $conn->prepare("SELECT player_id FROM players WHERE nickname = ?");
                if ($existingStmt && $existingStmt->bind_param("s", $nickname) && $existingStmt->execute()) {
                    $result = $existingStmt->get_result();
                    if ($result && $result->num_rows > 0) {
                        $player = $result->fetch_assoc();
                        $player_id = $player['player_id'];
                        error_log("Found existing player after duplicate error with ID: " . $player_id);
                        goto player_found; // Skip to after player is found/created
                    }
                }
            }
            
            throw new Exception('Database error while executing player insert');
        }
        
        $player_id = $conn->insert_id;
        error_log("Created new player with ID: " . $player_id);
    }

    // Label for goto when handling duplicate player after insert error
    player_found:

    // 2. Save task results based on task type
    if (!isset($data['taskType'])) {
        throw new Exception('Task type is required');
    }
    
    $taskType = strtolower(trim($data['taskType']));
    $validTaskTypes = ['gonogo', 'stroop', 'flanker'];
    
    if (!in_array($taskType, $validTaskTypes)) {
        $error = sprintf(
            'Invalid task type: "%s". Must be one of: %s',
            $data['taskType'],
            implode(', ', $validTaskTypes)
        );
        error_log($error);
        throw new Exception($error);
    }
    
    if (!isset($data['results']) || !is_array($data['results'])) {
        $error = 'Results data is required and must be an array. Received: ' . gettype($data['results'] ?? 'null');
        error_log($error);
        throw new Exception($error);
    }
    
    // Define required fields for each task type
    $requiredFields = [
        'gonogo' => [
            'goAccuracy',
            'noGoAccuracy',
            'commissionErrors',
            'omissionErrors',
            'avgGoRT',
            'subscore'
        ],
        'stroop' => [
            'congruentAccuracy',
            'incongruentAccuracy',
            'avgCongruentRT',
            'avgIncongruentRT',
            'accuracyCost',
            'rtCost',
            'congruentSubscore',
            'incongruentSubscore'
        ],
        'flanker' => [
            'congruentAccuracy',
            'incongruentAccuracy',
            'avgCongruentRT',
            'avgIncongruentRT',
            'accuracyCost',
            'rtCost',
            'congruentSubscore',
            'incongruentSubscore'
        ]
    ];
    
    // Validate required fields for the specific task type
    if (isset($requiredFields[$taskType])) {
        $missingFields = [];
        foreach ($requiredFields[$taskType] as $field) {
            if (!array_key_exists($field, $data['results'])) {
                $missingFields[] = $field;
            }
        }
        
        if (!empty($missingFields)) {
            $error = sprintf(
                'Missing required fields for %s task: %s. Received fields: %s',
                $taskType,
                implode(', ', $missingFields),
                implode(', ', array_keys($data['results']))
            );
            error_log($error);
            throw new Exception($error);
        }
    }
    
    $results = $data['results'];
    error_log("Processing task type: " . $taskType);
    error_log("Results data: " . print_r($results, true));
    
    switch ($taskType) {
        case 'gonogo':
            // Validate required fields for Go/No-Go
            $requiredFields = [
                'goAccuracy' => 'float',
                'noGoAccuracy' => 'float',
                'commissionErrors' => 'integer',
                'omissionErrors' => 'integer',
                'avgGoRT' => 'float',
                'subscore' => 'float'
            ];
            
            $missingFields = [];
            $invalidFields = [];
            
            foreach ($requiredFields as $field => $type) {
                if (!array_key_exists($field, $results)) {
                    $missingFields[] = $field;
                    continue;
                }
                
                // Check type
                $valid = false;
                switch ($type) {
                    case 'integer':
                        $valid = is_int($results[$field]);
                        break;
                    case 'float':
                        $valid = is_float($results[$field]) || is_int($results[$field]);
                        break;
                    default:
                        $valid = isset($results[$field]);
                }
                
                if (!$valid) {
                    $invalidFields[$field] = gettype($results[$field]);
                }
            }
            
            $errors = [];
            if (!empty($missingFields)) {
                $errors[] = 'Missing fields: ' . implode(', ', $missingFields);
            }
            if (!empty($invalidFields)) {
                $invalidMsgs = [];
                foreach ($invalidFields as $field => $actualType) {
                    $invalidMsgs[] = "$field (expected {$requiredFields[$field]}, got $actualType)";
                }
                $errors[] = 'Invalid field types: ' . implode(', ', $invalidMsgs);
            }
            
            if (!empty($errors)) {
                $errorMsg = 'Invalid Go/No-Go task data: ' . implode('; ', $errors);
                error_log($errorMsg . ' | Received data: ' . print_r($results, true));
                throw new Exception($errorMsg);
            }
            
            error_log('Saving Go/No-Go results for player ID: ' . $player_id);
            
            $query = "
                INSERT INTO game9_go_nogo (
                    player_id, go_accuracy, nogo_accuracy, commission_errors, 
                    omission_errors, avg_go_rt, subscore, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            ";
            
            error_log('Preparing Go/No-Go insert query: ' . preg_replace('/\s+/', ' ', trim($query)));
            
            $stmt = $conn->prepare($query);
            if (!$stmt) {
                $error = 'Prepare failed: ' . $conn->error . ' | Error No: ' . $conn->errno;
                error_log($error);
                throw new Exception('Database error while preparing Go/No-Go insert');
            }
            
            // Log the values being bound
            $bindValues = [
                $player_id,
                $results['goAccuracy'],
                $results['noGoAccuracy'],
                $results['commissionErrors'],
                $results['omissionErrors'],
                $results['avgGoRT'],
                $results['subscore']
            ];
            error_log('Binding values: ' . print_r($bindValues, true));
            
            // Bind parameters
            $bindResult = $stmt->bind_param(
                "idddidd",
                $bindValues[0], // player_id (integer)
                $bindValues[1], // goAccuracy (double)
                $bindValues[2], // noGoAccuracy (double)
                $bindValues[3], // commissionErrors (integer)
                $bindValues[4], // omissionErrors (integer)
                $bindValues[5], // avgGoRT (double)
                $bindValues[6]  // subscore (double)
            );
            
            if ($bindResult === false) {
                $error = 'Bind param failed: ' . $stmt->error . ' | Error No: ' . $stmt->errno;
                error_log($error);
                throw new Exception('Database error while binding Go/No-Go parameters');
            }
            
            // Execute the query
            error_log('Executing Go/No-Go insert query');
            $executeResult = $stmt->execute();
            
            if ($executeResult === false) {
                $error = 'Execute failed: ' . $stmt->error . ' | Error No: ' . $stmt->errno;
                error_log($error);
                
                // Check for duplicate entry error (1062 is MySQL's duplicate entry error code)
                if ($stmt->errno == 1062) {
                    error_log('Duplicate entry detected, but continuing with transaction');
                    // Continue with the transaction instead of failing
                } else {
                    throw new Exception('Database error while executing Go/No-Go insert');
                }
            } else {
                $insertId = $conn->insert_id;
                error_log('Successfully inserted Go/No-Go results with ID: ' . $insertId);
            }
            
            error_log('Successfully saved Go/No-Go results');
            break;
            
        case 'stroop':
            // Log the received data for debugging
            error_log('Received Stroop data: ' . print_r($results, true));
            
            // Validate required fields
            $requiredFields = [
                'congruentAccuracy', 'incongruentAccuracy',
                'avgCongruentRT', 'avgIncongruentRT',
                'accuracyCost', 'rtCost',
                'congruentSubscore', 'incongruentSubscore'
            ];
            
            $missingFields = [];
            foreach ($requiredFields as $field) {
                if (!isset($results[$field])) {
                    $missingFields[] = $field;
                }
            }
            
            if (!empty($missingFields)) {
                throw new Exception('Missing required fields: ' . implode(', ', $missingFields));
            }
            
            $stmt = $conn->prepare("
                INSERT INTO game9_stroop (
                    player_id, congruent_accuracy, incongruent_accuracy, 
                    avg_congruent_rt, avg_incongruent_rt, accuracy_cost, 
                    rt_cost, congruent_subscore, incongruent_subscore
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ") or die('Prepare failed: ' . $conn->error);
            
            $bindResult = $stmt->bind_param(
                "iddddddii", 
                $player_id,
                $results['congruentAccuracy'],
                $results['incongruentAccuracy'],
                $results['avgCongruentRT'],
                $results['avgIncongruentRT'],
                $results['accuracyCost'],
                $results['rtCost'],
                $results['congruentSubscore'],
                $results['incongruentSubscore']
            );
            
            if ($bindResult === false) {
                throw new Exception('Bind param failed: ' . $stmt->error);
            }
            
            $executeResult = $stmt->execute();
            if ($executeResult === false) {
                throw new Exception('Execute failed: ' . $stmt->error);
            }
            
            error_log('Stroop data saved successfully');
            break;
            
        case 'flanker':
            // Log the received data for debugging
            error_log('Received Flanker data: ' . print_r($results, true));
            
            // Validate required fields
            $requiredFields = [
                'congruentAccuracy', 'incongruentAccuracy',
                'avgCongruentRT', 'avgIncongruentRT',
                'accuracyCost', 'rtCost',
                'congruentSubscore', 'incongruentSubscore'
            ];
            
            $missingFields = [];
            foreach ($requiredFields as $field) {
                if (!isset($results[$field])) {
                    $missingFields[] = $field;
                }
            }
            
            if (!empty($missingFields)) {
                throw new Exception('Missing required fields for Flanker task: ' . implode(', ', $missingFields));
            }
            
            $stmt = $conn->prepare("
                INSERT INTO game9_flanker (
                    player_id, congruent_accuracy, incongruent_accuracy, 
                    avg_congruent_rt, avg_incongruent_rt, accuracy_cost, 
                    rt_cost, congruent_subscore, incongruent_subscore
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ") or die('Prepare failed: ' . $conn->error);
            
            $bindResult = $stmt->bind_param(
                "iddddddii", 
                $player_id,
                $results['congruentAccuracy'],
                $results['incongruentAccuracy'],
                $results['avgCongruentRT'],
                $results['avgIncongruentRT'],
                $results['accuracyCost'],
                $results['rtCost'],
                $results['congruentSubscore'],
                $results['incongruentSubscore']
            );
            
            if ($bindResult === false) {
                throw new Exception('Bind param failed: ' . $stmt->error);
            }
            
            $executeResult = $stmt->execute();
            if ($executeResult === false) {
                throw new Exception('Execute failed: ' . $stmt->error);
            }
            
            error_log('Flanker data saved successfully');
            break;
            
        default:
            throw new Exception('Invalid task type');
    }
    
    // 3. Save overall results
    if (!isset($data['overallScore'], $data['descriptor'])) {
        throw new Exception('Overall score and descriptor are required');
    }
    
    $overallScore = floatval($data['overallScore']);
    $descriptor = $conn->real_escape_string($data['descriptor']);
    
    error_log('Saving overall results - Score: ' . $overallScore . ', Descriptor: ' . $descriptor);
    
    $stmt = $conn->prepare("
        INSERT INTO game9_results (
            player_id, task_type, overall_score, descriptor
        ) VALUES (?, ?, ?, ?)
    ");
    $bindResult = $stmt->bind_param(
        "isds", 
        $player_id,
        $taskType,
        $overallScore,
        $descriptor
    );
    
    if ($bindResult === false) {
        throw new Exception('Bind param failed for overall results: ' . $stmt->error);
    }
    
    $executeResult = $stmt->execute();
    if ($executeResult === false) {
        throw new Exception('Failed to save overall results: ' . $stmt->error);
    }
    
    // Commit the transaction
    $conn->commit();
    
    // Return success response
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'success',
        'message' => 'Results saved successfully',
        'data' => [
            'player_id' => $player_id,
            'task_type' => $taskType,
            'overall_score' => $overallScore,
            'descriptor' => $descriptor,
            'timestamp' => gmdate('Y-m-d H:i:s')
        ]
    ]);
    exit();
    
} catch (Exception $e) {
    // Log the full error with stack trace
    $errorMessage = 'Error in saveGame9Results: ' . $e->getMessage() . "\n" . $e->getTraceAsString();
    error_log($errorMessage);
    
    // Rollback transaction on error
    if (isset($conn) && $conn) {
        $conn->rollback();
    }
    
    http_response_code(500);
    $errorResponse = [
        'status' => 'error',
        'message' => 'Failed to save results',
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ];
    
    // Don't expose sensitive info in production
    if (strpos($_SERVER['HTTP_HOST'] ?? '', 'localhost') === false) {
        unset($errorResponse['file'], $errorResponse['line']);
    }
        
    echo json_encode($errorResponse);
} finally {
    // Close connection if it exists
    if (isset($conn) && $conn) {
        $conn->close();
    }
}
?>
