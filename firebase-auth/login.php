<?php
header('Content-Type: application/json');
require 'config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['email']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password are required']);
    exit;
}

$email = $input['email'];
$password = $input['password'];

try {
    $signInResult = $auth->signInWithEmailAndPassword($email, $password);
    $idToken = $signInResult->idToken();
    
    http_response_code(200);
    echo json_encode([
        'message' => 'Login successful',
        'token' => $idToken,
        'user' => [
            'uid' => $signInResult->firebaseUserId(),
            'email' => $email
        ]
    ]);
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['error' => $e->getMessage()]);
}
?>