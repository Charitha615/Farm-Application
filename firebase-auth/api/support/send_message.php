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
        if (empty($requestData['message'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Message is required']);
            exit;
        }

        // Get farmer ID from session or token (you'll need to implement your auth system)
        $farmerId = 'demo_farmer_123'; // Replace with actual farmer ID from auth
        $farmerName = 'Demo Farmer'; // Replace with actual farmer name from auth
        $farmerEmail = 'farmer@example.com'; // Replace with actual farmer email from auth

        // Create message data
        $messageData = [
            'farmer_id' => $farmerId,
            'farmer_name' => $farmerName,
            'farmer_email' => $farmerEmail,
            'message' => $requestData['message'],
            'status' => 'pending',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];

        // Push to Firebase
        $messagesRef = $database->getReference('support_messages');
        $newMessageRef = $messagesRef->push();
        $newMessageRef->set($messageData);

        http_response_code(201);
        echo json_encode([
            'id' => $newMessageRef->getKey(),
            'message' => 'Support message sent successfully'
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>