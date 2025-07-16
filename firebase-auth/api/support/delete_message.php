<?php
require __DIR__ . '/../../config.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        $requestData = json_decode(file_get_contents('php://input'), true);
        
        if (empty($requestData['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Message ID is required']);
            exit;
        }

        $messageRef = $database->getReference('support_messages/' . $requestData['id']);
        $message = $messageRef->getValue();

        if (!$message) {
            http_response_code(404);
            echo json_encode(['error' => 'Message not found']);
            exit;
        }

        // Delete message
        $messageRef->remove();

        http_response_code(200);
        echo json_encode(['message' => 'Message deleted successfully']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>