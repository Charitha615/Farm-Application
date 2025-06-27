<?php
require __DIR__ . '/../../config.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$notificationsRef = $database->getReference('notifications');

// GET notifications (filter by user_id or is_read if provided)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $notifications = $notificationsRef->getValue();
        
        if (!$notifications) {
            $notifications = [];
        }
        
        // Filter by user_id if provided
        if (isset($_GET['user_id'])) {
            $filteredNotifications = [];
            foreach ($notifications as $id => $notification) {
                if ($notification['user_id'] == $_GET['user_id']) {
                    $filteredNotifications[$id] = $notification;
                }
            }
            $notifications = $filteredNotifications;
        }
        
        // Filter by read status if provided
        if (isset($_GET['is_read'])) {
            $filteredNotifications = [];
            foreach ($notifications as $id => $notification) {
                if (isset($notification['is_read']) && $notification['is_read'] == ($_GET['is_read'] === 'true')) {
                    $filteredNotifications[$id] = $notification;
                }
            }
            $notifications = $filteredNotifications;
        }
        
        http_response_code(200);
        echo json_encode($notifications);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// PUT - Mark notification as read
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            throw new Exception('Invalid input data');
        }
        
        // Mark single notification as read
        if (isset($_GET['id'])) {
            $notificationId = $_GET['id'];
            $notification = $notificationsRef->getChild($notificationId)->getValue();
            
            if (!$notification) {
                throw new Exception('Notification not found');
            }
            
            $notificationsRef->getChild($notificationId)->update([
                'is_read' => true,
                'updated_at' => date('Y-m-d H:i:s')
            ]);
            
            http_response_code(200);
            echo json_encode(['message' => 'Notification marked as read']);
            exit;
        }
        
        // Mark all notifications as read for a user
        if (isset($input['user_id']) && isset($input['mark_all_read'])) {
            $notifications = $notificationsRef->getValue();
            
            foreach ($notifications as $id => $notification) {
                if ($notification['user_id'] == $input['user_id'] && (!isset($notification['is_read']) || !$notification['is_read'])) {
                    $notificationsRef->getChild($id)->update([
                        'is_read' => true,
                        'updated_at' => date('Y-m-d H:i:s')
                    ]);
                }
            }
            
            http_response_code(200);
            echo json_encode(['message' => 'All notifications marked as read']);
            exit;
        }
        
        throw new Exception('Invalid request parameters');
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>