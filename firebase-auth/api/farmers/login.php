<?php
require __DIR__ . '/../../config.php';

// Set CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Get and validate input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if ($input === null) {
        throw new Exception('Invalid JSON input');
    }

    // Validate required fields
    if (empty($input['email']) || empty($input['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        exit;
    }

    // Validate email format
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        exit;
    }

    // Verify user exists
    $user = $auth->getUserByEmail($input['email']);
    
    // Check if user is a farmer
    $userData = $database->getReference('farmers/' . $user->uid)->getValue();
    
    if (!$userData || ($userData['role'] ?? null) !== 'farmer') {
        throw new Exception('Access restricted to registered farmers only');
    }

    // Check if account is disabled
    if (($userData['status'] ?? null) === 'disabled') {
        throw new Exception('Account disabled. Please contact support.');
    }

    // Sign in with email and password
    $signInResult = $auth->signInWithEmailAndPassword($input['email'], $input['password']);
    $idToken = $signInResult->idToken();

    // Prepare response data
    $response = [
        'message' => 'Login successful',
        'token' => $idToken,
        'user' => [
            'uid' => $user->uid,
            'email' => $user->email,
            'full_name' => $userData['full_name'] ?? '',
            'nic' => $userData['nic'] ?? '',
            'phone' => $userData['phone'] ?? '',
            'role' => $userData['role'] ?? 'farmer'
        ]
    ];

    http_response_code(200);
    echo json_encode($response);

} catch (\Kreait\Firebase\Exception\Auth\UserNotFound $e) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid email or password']);
} catch (\Kreait\Firebase\Exception\Auth\InvalidPassword $e) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid email or password']);
} catch (\Kreait\Firebase\Exception\Auth\UserDisabled $e) {
    http_response_code(403);
    echo json_encode(['error' => 'Account disabled. Please contact support.']);
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['error' => $e->getMessage()]);
}
?>