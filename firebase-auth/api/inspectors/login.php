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
        
        // Get the collection name from query parameter or default to 'users'
        $collection = $_GET['collection'] ?? 'inspectors';
        
        // Check if user exists in the specified collection
        $ref = $database->getReference($collection);
        $users = $ref->getValue();
        $foundUser = null;

        foreach ($users as $id => $user) {
            if (isset($user['email']) && $user['email'] === $requestData['email'] 
                && isset($user['phone']) && $user['phone'] === $requestData['phone']) {
                $foundUser = ['id' => $id] + $user;
                break;
            }
        }

        if ($foundUser) {
            http_response_code(200);
            echo json_encode([
                'exists' => true,
                'user' => $foundUser
            ]);
        } else {
            http_response_code(200);
            echo json_encode([
                'exists' => false,
                'message' => 'No user found with these credentials'
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