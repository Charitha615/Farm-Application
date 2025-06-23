<?php
header('Content-Type: application/json');
require 'config.php';

$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';

if (empty($authHeader) || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['error' => 'Token not provided']);
    exit;
}

$idToken = $matches[1];

try {
    $verifiedIdToken = $auth->verifyIdToken($idToken);
    $uid = $verifiedIdToken->claims()->get('sub');
    $user = $auth->getUser($uid);
    
    http_response_code(200);
    echo json_encode([
        'message' => 'Token is valid',
        'user' => [
            'uid' => $user->uid,
            'email' => $user->email
        ]
    ]);
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token: ' . $e->getMessage()]);
}
?>