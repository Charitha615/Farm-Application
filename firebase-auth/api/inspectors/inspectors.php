<?php
require __DIR__ . '/../../config.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Sample Inspector fields:
/*
{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "license_number": "INS12345",
    "specialization": ["construction", "electrical"],
    "status": "active", // active/inactive
    "address": {
        "street": "123 Main St",
        "city": "Metropolis",
        "state": "CA",
        "zip": "12345",
        "country": "USA"
    }
}
*/

// GET all inspectors
if ($_SERVER['REQUEST_METHOD'] === 'GET' && empty($_GET['id'])) {
    try {
        $inspectorsRef = $database->getReference('inspectors');
        $allInspectors = $inspectorsRef->getValue();
        
        if (!$allInspectors) {
            $allInspectors = [];
        }
        
        http_response_code(200);
        echo json_encode($allInspectors);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// GET single inspector by ID
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    try {
        $inspectorId = $_GET['id'];
        $inspectorRef = $database->getReference('inspectors/' . $inspectorId);
        $inspector = $inspectorRef->getValue();
        
        if (!$inspector) {
            http_response_code(404);
            echo json_encode(['error' => 'Inspector not found']);
            exit;
        }
        
        http_response_code(200);
        echo json_encode(['id' => $inspectorId] + $inspector);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// POST - Create a new inspector
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $requestData = json_decode(file_get_contents('php://input'), true);
        
        // Validate input
        if (empty($requestData['name']) || empty($requestData['email'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Name and email are required']);
            exit;
        }
        
        // Set default values if not provided
        $inspectorData = [
            'name' => $requestData['name'],
            'email' => $requestData['email'],
            'phone' => $requestData['phone'] ?? '',
            'license_number' => $requestData['license_number'] ?? '',
            'specialization' => $requestData['specialization'] ?? [],
            'status' => $requestData['status'] ?? 'active',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        // Add address if provided
        if (isset($requestData['address'])) {
            $inspectorData['address'] = [
                'street' => $requestData['address']['street'] ?? '',
                'city' => $requestData['address']['city'] ?? '',
                'state' => $requestData['address']['state'] ?? '',
                'zip' => $requestData['address']['zip'] ?? '',
                'country' => $requestData['address']['country'] ?? ''
            ];
        }
        
        // Push data to Firebase
        $inspectorsRef = $database->getReference('inspectors');
        $newInspectorRef = $inspectorsRef->push();
        $newInspectorRef->set($inspectorData);
        
        http_response_code(201);
        echo json_encode([
            'id' => $newInspectorRef->getKey(),
            'message' => 'Inspector created successfully',
            'data' => $inspectorData
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// PUT - Update an inspector
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    try {
        $requestData = json_decode(file_get_contents('php://input'), true);
        
        if (empty($requestData['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Inspector ID is required']);
            exit;
        }
        
        $inspectorId = $requestData['id'];
        $inspectorRef = $database->getReference('inspectors/' . $inspectorId);
        $currentData = $inspectorRef->getValue();
        
        if (!$currentData) {
            http_response_code(404);
            echo json_encode(['error' => 'Inspector not found']);
            exit;
        }
        
        // Prepare update data
        $updateData = [
            'name' => $requestData['name'] ?? $currentData['name'],
            'email' => $requestData['email'] ?? $currentData['email'],
            'phone' => $requestData['phone'] ?? $currentData['phone'] ?? '',
            'license_number' => $requestData['license_number'] ?? $currentData['license_number'] ?? '',
            'specialization' => $requestData['specialization'] ?? $currentData['specialization'] ?? [],
            'status' => $requestData['status'] ?? $currentData['status'] ?? 'active',
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        // Handle address update
        if (isset($requestData['address'])) {
            $currentAddress = $currentData['address'] ?? [];
            $updateData['address'] = [
                'street' => $requestData['address']['street'] ?? $currentAddress['street'] ?? '',
                'city' => $requestData['address']['city'] ?? $currentAddress['city'] ?? '',
                'state' => $requestData['address']['state'] ?? $currentAddress['state'] ?? '',
                'zip' => $requestData['address']['zip'] ?? $currentAddress['zip'] ?? '',
                'country' => $requestData['address']['country'] ?? $currentAddress['country'] ?? ''
            ];
        } elseif (isset($currentData['address'])) {
            $updateData['address'] = $currentData['address'];
        }
        
        // Update the inspector
        $inspectorRef->update($updateData);
        
        http_response_code(200);
        echo json_encode([
            'id' => $inspectorId,
            'message' => 'Inspector updated successfully',
            'data' => $updateData
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// DELETE - Remove an inspector
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        $requestData = json_decode(file_get_contents('php://input'), true);
        
        if (empty($requestData['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Inspector ID is required']);
            exit;
        }
        
        $inspectorId = $requestData['id'];
        $inspectorRef = $database->getReference('inspectors/' . $inspectorId);
        $inspector = $inspectorRef->getValue();
        
        if (!$inspector) {
            http_response_code(404);
            echo json_encode(['error' => 'Inspector not found']);
            exit;
        }
        
        // Soft delete (recommended) - set status to inactive
        // $inspectorRef->update(['status' => 'inactive', 'updated_at' => date('Y-m-d H:i:s')]);
        
        // Or hard delete:
        $inspectorRef->remove();
        
        http_response_code(200);
        echo json_encode([
            'id' => $inspectorId,
            'message' => 'Inspector deleted successfully'
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