<?php
require __DIR__ . '/../../config.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $requestData = json_decode(file_get_contents('php://input'), true);
        
        // Validate input
        if (empty($requestData['email']) || empty($requestData['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required']);
            exit;
        }
        
        // Get the collection name from query parameter or default to 'inspectors'
        $collection = $_GET['collection'] ?? 'inspectors';
        
        // Check if user exists in the specified collection
        $ref = $database->getReference($collection);
        $users = $ref->getValue();
        $foundUser = null;

        foreach ($users as $id => $user) {
            if (isset($user['email']) && $user['email'] === $requestData['email']) {
                // Verify password
                if (isset($user['password']) && password_verify($requestData['password'], $user['password'])) {
                    $foundUser = ['id' => $id] + $user;
                    // Remove password from response
                    unset($foundUser['password']);
                    break;
                }
            }
        }

        if ($foundUser) {
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'user' => $foundUser
            ]);
        } else {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid email or password'
            ]);
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>