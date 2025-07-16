<?php
require __DIR__ . '/../../config.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Get farmer ID from session or token (you'll need to implement your auth system)
        $farmerId = 'demo_farmer_123'; // Replace with actual farmer ID from auth

        // Get messages for this farmer
        $messagesRef = $database->getReference('support_messages')
            ->orderByChild('farmer_id')
            ->equalTo($farmerId);
        $messages = $messagesRef->getValue();

        if (!$messages) {
            $messages = [];
        } else {
            // Add IDs to messages
            $messages = array_map(function($id, $message) {
                return ['id' => $id] + $message;
            }, array_keys($messages), $messages);
        }

        http_response_code(200);
        echo json_encode(array_values($messages));
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>