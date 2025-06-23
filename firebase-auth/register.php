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
    $user = $auth->createUserWithEmailAndPassword($email, $password);
    
    http_response_code(201);
    echo json_encode([
        'message' => 'User registered successfully',
        'user' => [
            'uid' => $user->uid,
            'email' => $user->email,
            'emailVerified' => $user->emailVerified
        ]
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>