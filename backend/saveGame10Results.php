<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(['status' => 'error', 'message' => 'No input data']);
    exit;
}

$player_name = $conn->real_escape_string($data['player_name'] ?? '');
$age_group = $conn->real_escape_string($data['age_group'] ?? '');
$chosen_reward = $conn->real_escape_string($data['chosen_reward'] ?? '');
$waited_for = intval($data['waited_for'] ?? 0);
$reasoning = $conn->real_escape_string($data['reasoning'] ?? '');
$matrix_answers = $conn->real_escape_string(json_encode($data['matrix_answers'] ?? []));
$score = intval($data['score'] ?? 0);
$interpretation = $conn->real_escape_string($data['interpretation'] ?? '');

$sql = "INSERT INTO game10_results 
    (player_name, age_group, chosen_reward, waited_for, reasoning, matrix_answers, score, interpretation)
    VALUES 
    ('$player_name', '$age_group', '$chosen_reward', $waited_for, '$reasoning', '$matrix_answers', $score, '$interpretation')";

if ($conn->query($sql)) {
    echo json_encode(['status' => 'success', 'message' => 'Result saved']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'DB error', 'error' => $conn->error]);
}

$conn->close();
?>