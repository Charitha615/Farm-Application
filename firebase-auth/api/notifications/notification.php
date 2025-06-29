<?php
require __DIR__ . '/../../config.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$notificationsRef = $database->getReference('notifications');

// GET notifications for a specific user
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        if (!isset($_GET['user_id'])) {
            throw new Exception('User ID is required');
        }
        
        $notifications = $notificationsRef->orderByChild('user_id')->equalTo($_GET['user_id'])->getValue();
        
        if (!$notifications) {
            $notifications = [];
        }
        
        // Filter by read/unread if specified
        if (isset($_GET['is_read'])) {
            $filtered = [];
            foreach ($notifications as $id => $notification) {
                if ($notification['is_read'] == ($_GET['is_read'] === 'true')) {
                    $filtered[$id] = $notification;
                }
            }
            $notifications = $filtered;
        }
        
        http_response_code(200);
        echo json_encode($notifications);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// POST - Mark notification as read
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        if (!isset($_GET['id'])) {
            throw new Exception('Notification ID is required');
        }
        
        $notificationId = $_GET['id'];
        $notification = $notificationsRef->getChild($notificationId)->getValue();
        
        if (!$notification) {
            throw new Exception('Notification not found');
        }
        
        $updates = [
            'is_read' => true,
            'read_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        $notificationsRef->getChild($notificationId)->update($updates);
        
        http_response_code(200);
        echo json_encode(['message' => 'Notification marked as read']);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>