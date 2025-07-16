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
        
        if (empty($requestData['messageId']) || empty($requestData['reply']) || empty($requestData['farmerEmail'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Message ID, reply, and farmer email are required']);
            exit;
        }

        // In a real application, you would:
        // 1. Store the reply in the database
        // 2. Send an email to the farmer
        
        // For demo purposes, we'll just return a success message
        $replyData = [
            'message_id' => $requestData['messageId'],
            'admin_reply' => $requestData['reply'],
            'replied_at' => date('Y-m-d H:i:s')
        ];

        // Store reply in Firebase
        $repliesRef = $database->getReference('support_replies');
        $newReplyRef = $repliesRef->push();
        $newReplyRef->set($replyData);

        // Update message status
        $messageRef = $database->getReference('support_messages/' . $requestData['messageId']);
        $messageRef->update([
            'status' => 'replied',
            'updated_at' => date('Y-m-d H:i:s')
        ]);

        http_response_code(200);
        echo json_encode(['message' => 'Reply sent successfully']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>