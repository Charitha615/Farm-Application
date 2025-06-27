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

$alertsRef = $database->getReference('risk_alerts');

// GET alerts (filter by farmer_id or is_read if provided)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $alerts = $alertsRef->getValue();
        
        if (!$alerts) {
            $alerts = [];
        }
        
        // Filter by farmer_id if provided
        if (isset($_GET['farmer_id'])) {
            $filteredAlerts = [];
            foreach ($alerts as $id => $alert) {
                if ($alert['farmer_id'] == $_GET['farmer_id']) {
                    $filteredAlerts[$id] = $alert;
                }
            }
            $alerts = $filteredAlerts;
        }
        
        // Filter by read status if provided
        if (isset($_GET['is_read'])) {
            $filteredAlerts = [];
            foreach ($alerts as $id => $alert) {
                if (isset($alert['is_read']) && $alert['is_read'] == ($_GET['is_read'] === 'true')) {
                    $filteredAlerts[$id] = $alert;
                }
            }
            $alerts = $filteredAlerts;
        }
        
        http_response_code(200);
        echo json_encode($alerts);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// PUT - Mark alert as read
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            throw new Exception('Invalid input data');
        }
        
        // Mark single alert as read
        if (isset($_GET['id'])) {
            $alertId = $_GET['id'];
            $alert = $alertsRef->getChild($alertId)->getValue();
            
            if (!$alert) {
                throw new Exception('Alert not found');
            }
            
            $alertsRef->getChild($alertId)->update([
                'is_read' => true,
                'updated_at' => date('Y-m-d H:i:s')
            ]);
            
            http_response_code(200);
            echo json_encode(['message' => 'Alert marked as read']);
            exit;
        }
        
        // Mark all alerts as read for a farmer
        if (isset($input['farmer_id']) && isset($input['mark_all_read'])) {
            $alerts = $alertsRef->getValue();
            
            foreach ($alerts as $id => $alert) {
                if ($alert['farmer_id'] == $input['farmer_id'] && (!isset($alert['is_read']) || !$alert['is_read'])) {
                    $alertsRef->getChild($id)->update([
                        'is_read' => true,
                        'updated_at' => date('Y-m-d H:i:s')
                    ]);
                }
            }
            
            http_response_code(200);
            echo json_encode(['message' => 'All alerts marked as read']);
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