<?php
require __DIR__ . '/../../config.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$token = getBearerToken();
if (!$token) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

try {
    $verifiedIdToken = $auth->verifyIdToken($token);
    $uid = $verifiedIdToken->claims()->get('sub');
    
    $notificationsRef = $database->getReference('notifications/' . $uid)->orderByChild('timestamp');
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get all notifications
        $notifications = $notificationsRef->getValue();
        
        // Count unread
        $unreadCount = 0;
        if ($notifications) {
            foreach ($notifications as $notification) {
                if (empty($notification['read'])) {
                    $unreadCount++;
                }
            }
        }
        
        http_response_code(200);
        echo json_encode([
            'notifications' => $notifications ? array_reverse($notifications) : [],
            'unread_count' => $unreadCount
        ]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Mark as read
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (empty($input['notification_id'])) {
            throw new Exception('Notification ID is required');
        }
        
        $notificationRef = $database->getReference('notifications/' . $uid . '/' . $input['notification_id']);
        $notificationRef->update(['read' => true, 'read_at' => date('Y-m-d H:i:s')]);
        
        http_response_code(200);
        echo json_encode(['message' => 'Notification marked as read']);
    }
    
} catch (\Kreait\Firebase\Exception\Auth\FailedToVerifyToken $e) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}

function getBearerToken() {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
            return $matches[1];
        }
    }
    return null;
}
?>