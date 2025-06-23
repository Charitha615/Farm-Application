<?php
require __DIR__ . '/../../config.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$policiesRef = $database->getReference('insurance_policies');

// GET all policies
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $policies = $policiesRef->getValue();
        
        if (!$policies) {
            $policies = [];
        }
        
        // Convert to array if single policy is requested
        if (isset($_GET['id'])) {
            $policyId = $_GET['id'];
            if (isset($policies[$policyId])) {
                $policies = [$policyId => $policies[$policyId]];
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Policy not found']);
                exit;
            }
        }
        
        http_response_code(200);
        echo json_encode($policies);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// POST - Create new policy
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            throw new Exception('Invalid input data');
        }
        
        // Required fields validation
        $requiredFields = ['farmer_id', 'crop_type', 'land_size', 'location', 'expected_yield', 'season', 'coverage_type'];
        foreach ($requiredFields as $field) {
            if (!isset($input[$field])) {
                throw new Exception("Missing required field: $field");
            }
        }
        
        // Add additional fields
        $input['status'] = 'active';
        $input['created_at'] = date('Y-m-d H:i:s');
        $input['updated_at'] = date('Y-m-d H:i:s');
        
        // Push to Firebase
        $newPolicyRef = $policiesRef->push();
        $newPolicyRef->set($input);
        
        http_response_code(201);
        echo json_encode([
            'message' => 'Policy created successfully',
            'id' => $newPolicyRef->getKey()
        ]);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// PUT - Update policy
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    try {
        if (!isset($_GET['id'])) {
            throw new Exception('Policy ID is required');
        }
        
        $policyId = $_GET['id'];
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            throw new Exception('Invalid input data');
        }
        
        // Get existing policy
        $policy = $policiesRef->getChild($policyId)->getValue();
        if (!$policy) {
            throw new Exception('Policy not found');
        }
        
        // Update allowed fields
        $allowedFields = [
            'crop_type', 'land_size', 'location', 'expected_yield', 
            'season', 'coverage_type', 'status', 'start_date', 'end_date'
        ];
        
        $updates = [];
        foreach ($allowedFields as $field) {
            if (isset($input[$field])) {
                $updates[$field] = $input[$field];
            }
        }
        
        $updates['updated_at'] = date('Y-m-d H:i:s');
        
        // Update in Firebase
        $policiesRef->getChild($policyId)->update($updates);
        
        http_response_code(200);
        echo json_encode(['message' => 'Policy updated successfully']);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// DELETE - Remove policy
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        if (!isset($_GET['id'])) {
            throw new Exception('Policy ID is required');
        }
        
        $policyId = $_GET['id'];
        $policyRef = $policiesRef->getChild($policyId);
        
        if (!$policyRef->getValue()) {
            throw new Exception('Policy not found');
        }
        
        $policyRef->remove();
        
        http_response_code(200);
        echo json_encode(['message' => 'Policy deleted successfully']);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>