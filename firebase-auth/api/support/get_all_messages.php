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
        // Get all messages (admin view)
        $messagesRef = $database->getReference('support_messages');
        $messages = $messagesRef->getValue();

        if (!$messages) {
            $messages = [];
        } else {
            // Add IDs to messages
            $messages = array_map(function($id, $message) {
                return ['id' => $id] + $message;
            }, array_keys($messages), $messages);
        }

        // Sort by date (newest first)
        usort($messages, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

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