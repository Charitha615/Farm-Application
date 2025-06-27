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

$applicationsRef = $database->getReference('insurance_applications');

// GET applications (filter by policy_id or inspector_id if provided)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $applications = $applicationsRef->getValue();
        
        if (!$applications) {
            $applications = [];
        }
        
        // Filter by policy_id if provided
        if (isset($_GET['policy_id'])) {
            $filteredApplications = [];
            foreach ($applications as $id => $app) {
                if ($app['policy_id'] == $_GET['policy_id']) {
                    $filteredApplications[$id] = $app;
                }
            }
            $applications = $filteredApplications;
        }
        
        // Filter by inspector_id if provided
        if (isset($_GET['inspector_id'])) {
            $filteredApplications = [];
            foreach ($applications as $id => $app) {
                if (isset($app['inspector_id']) && $app['inspector_id'] == $_GET['inspector_id']) {
                    $filteredApplications[$id] = $app;
                }
            }
            $applications = $filteredApplications;
        }
        
        http_response_code(200);
        echo json_encode($applications);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// POST - Create new application
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            throw new Exception('Invalid input data');
        }
        
        // Required fields validation
        $requiredFields = ['policy_id', 'farmer_id', 'application_type'];
        foreach ($requiredFields as $field) {
            if (!isset($input[$field])) {
                throw new Exception("Missing required field: $field");
            }
        }
        
        // Add additional fields
        $input['status'] = 'pending';
        $input['application_date'] = date('Y-m-d H:i:s');
        $input['updated_at'] = date('Y-m-d H:i:s');
        
        // Push to Firebase
        $newAppRef = $applicationsRef->push();
        $newAppRef->set($input);
        
        http_response_code(201);
        echo json_encode([
            'message' => 'Application created successfully',
            'id' => $newAppRef->getKey()
        ]);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// PUT - Update application (approve/reject)
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    try {
        if (!isset($_GET['id'])) {
            throw new Exception('Application ID is required');
        }
        
        $appId = $_GET['id'];
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            throw new Exception('Invalid input data');
        }
        
        // Get existing application
        $application = $applicationsRef->getChild($appId)->getValue();
        if (!$application) {
            throw new Exception('Application not found');
        }
        
        // Validate status
        if (!isset($input['status']) || !in_array($input['status'], ['approved', 'rejected', 'pending'])) {
            throw new Exception('Invalid status value');
        }
        
        // Prepare updates
        $updates = [
            'status' => $input['status'],
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        // Add notes if provided
        if (isset($input['notes'])) {
            $updates['notes'] = $input['notes'];
        }
        
        // Add inspector if approved
        if ($input['status'] === 'approved' && isset($input['inspector_id'])) {
            $updates['inspector_id'] = $input['inspector_id'];
        }
        
        // Update in Firebase
        $applicationsRef->getChild($appId)->update($updates);
        
        http_response_code(200);
        echo json_encode(['message' => 'Application updated successfully']);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>