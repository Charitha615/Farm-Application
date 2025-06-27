<?php
require __DIR__ . '/../../config.php';

// =============================================
// 1. CORS Configuration (For Web and Mobile)
// =============================================
header("Access-Control-Allow-Origin: *"); // Temporary for development
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Respond to preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// =============================================
// 2. Input Validation & Sanitization
// =============================================
try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate JSON input
    if ($input === null || json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON input');
    }

    // Required fields check
    $requiredFields = ['email', 'password'];
    foreach ($requiredFields as $field) {
        if (empty($input[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }

    // Sanitize and validate email
    $email = filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }

    // Validate password length
    $password = $input['password'];
    if (strlen($password) < 8) {
        throw new Exception('Password must be at least 8 characters');
    }

    // =============================================
    // 3. Firebase Authentication
    // =============================================
    $user = $auth->getUserByEmail($email);
    
    // Check if user exists in farmers database
    $userData = $database->getReference('farmers/' . $user->uid)->getValue();
    
    if (!$userData || ($userData['role'] ?? null) !== 'farmer') {
        throw new Exception('Access restricted to registered farmers only');
    }

    // Check account status
    if (($userData['status'] ?? null) === 'disabled') {
        throw new Exception('Account disabled. Please contact support.');
    }

    // Verify password
    $signInResult = $auth->signInWithEmailAndPassword($email, $password);
    $idToken = $signInResult->idToken();
    $refreshToken = $signInResult->refreshToken();

    // =============================================
    // 4. Response Preparation
    // =============================================
    $response = [
        'status' => 'success',
        'message' => 'Login successful',
        'token' => $idToken,
        'refreshToken' => $refreshToken,
        'user' => [
            'uid' => $user->uid,
            'email' => $user->email,
            'emailVerified' => $user->emailVerified,
            'displayName' => $userData['full_name'] ?? '',
            'phoneNumber' => $userData['phone'] ?? '',
            'photoURL' => $userData['photo_url'] ?? null,
            'metadata' => [
                'createdAt' => $user->metadata->createdAt,
                'lastLoginAt' => $user->metadata->lastLoginAt
            ],
            'customClaims' => [
                'role' => $userData['role'] ?? 'farmer',
                'nic' => $userData['nic'] ?? null
            ]
        ]
    ];

    http_response_code(200);
    echo json_encode($response);

} catch (\Kreait\Firebase\Exception\Auth\UserNotFound $e) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'error' => 'Invalid email or password']);
} catch (\Kreait\Firebase\Exception\Auth\InvalidPassword $e) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'error' => 'Invalid email or password']);
} catch (\Kreait\Firebase\Exception\Auth\UserDisabled $e) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'error' => 'Account disabled. Please contact support.']);
} catch (\Kreait\Firebase\Exception\Auth\EmailNotVerified $e) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'error' => 'Email not verified. Please check your inbox.']);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'error' => $e->getMessage()]);
}
?>