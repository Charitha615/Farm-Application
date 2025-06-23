<?php
require __DIR__ . '/../../config.php';

// CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle OPTIONS request
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
    $requiredFields = ['full_name', 'nic', 'email', 'phone', 'password'];
    $missingFields = [];
    
    foreach ($requiredFields as $field) {
        if (empty($input[$field])) {
            $missingFields[] = $field;
        }
    }
    
    if (!empty($missingFields)) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Missing required fields',
            'missing_fields' => $missingFields
        ]);
        exit;
    }

    // Validate email format
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        exit;
    }

    // Validate password length
    if (strlen($input['password']) < 6) {
        http_response_code(400);
        echo json_encode(['error' => 'Password must be at least 6 characters']);
        exit;
    }

    // Create Firebase user
    $userProperties = [
        'email' => $input['email'],
        'emailVerified' => false,
        'password' => $input['password'],
        'disabled' => false,
    ];
    
    $createdUser = $auth->createUser($userProperties);
    
    // Store additional user data
    $farmerData = [
        'uid' => $createdUser->uid,
        'full_name' => $input['full_name'],
        'nic' => $input['nic'],
        'email' => $input['email'],
        'phone' => $input['phone'],
        'role' => 'farmer',
        'created_at' => date('Y-m-d H:i:s'),
        'status' => 'active'
    ];
    
    // Optional fields
    if (!empty($input['address'])) $farmerData['address'] = $input['address'];
    if (!empty($input['language'])) $farmerData['language'] = $input['language'];
    
    $database->getReference('farmers/' . $createdUser->uid)->set($farmerData);
    
    http_response_code(201);
    echo json_encode([
        'message' => 'Farmer registered successfully',
        'user' => [
            'uid' => $createdUser->uid,
            'email' => $createdUser->email,
            'full_name' => $input['full_name'],
            'nic' => $input['nic']
        ]
    ]);
    
} catch (\Kreait\Firebase\Exception\Auth\EmailExists $e) {
    http_response_code(400);
    echo json_encode(['error' => 'Email already exists']);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>