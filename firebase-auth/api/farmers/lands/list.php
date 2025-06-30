<?php
require __DIR__ . '/../../../config.php';

// Set CORS headers (consistent with first file but improved)
header("Access-Control-Allow-Origin: http://localhost:3000"); // More secure than '*'
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Added Authorization
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $database = $factory->createDatabase();
    
    // Check for farmer_uid parameter in query string
    $farmerUid = $_GET['farmer_uid'] ?? null;
    $landId = $_GET['id'] ?? null;

    // Add token verification for protected endpoints (like in first file)
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        $token = getBearerToken();
        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }
        
        try {
            $verifiedIdToken = $auth->verifyIdToken($token);
            $uid = $verifiedIdToken->claims()->get('sub');
            // You could add additional authorization checks here
        } catch (\Kreait\Firebase\Exception\Auth\FailedToVerifyToken $e) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid token']);
            exit;
        }
    }

    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            if ($landId) {
                // Get single land by ID
                $land = $database->getReference('lands/' . $landId)->getValue();
                
                if (!$land) {
                    throw new Exception('Land not found', 404);
                }
                
                http_response_code(200);
                echo json_encode($land);
                
            } elseif ($farmerUid) {
                // Get lands by farmer_uid
                $lands = $database->getReference('lands')
                    ->orderByChild('farmer_uid')
                    ->equalTo($farmerUid)
                    ->getValue();
                
                http_response_code(200);
                echo json_encode($lands ?: []);
                
            } else {
                // Get all lands
                $lands = $database->getReference('lands')->getValue();
                
                http_response_code(200);
                echo json_encode($lands ?: []);
            }
            break;

        case 'POST':
            // Create new land
            $input = json_decode(file_get_contents('php://input'), true);
            if ($input === null && json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Invalid JSON input', 400);
            }

            $requiredFields = ['farmer_uid', 'name', 'province', 'district', 'size'];
            foreach ($requiredFields as $field) {
                if (empty($input[$field])) {
                    throw new Exception("$field is required", 400);
                }
            }

            $landData = [
                'farmer_uid' => $input['farmer_uid'],
                'name' => $input['name'],
                'province' => $input['province'],
                'district' => $input['district'],
                'size' => (float)$input['size'],
                'created_at' => date('Y-m-d H:i:s'),
                'status' => 'active'
            ];

            // Optional fields
            if (!empty($input['coordinates'])) $landData['coordinates'] = $input['coordinates'];
            if (!empty($input['description'])) $landData['description'] = $input['description'];
            if (isset($input['document_url'])) $landData['document_url'] = $input['document_url']; // Add document_url if provided

            $newLandRef = $database->getReference('lands')->push($landData);
            
            http_response_code(201);
            echo json_encode([
                'message' => 'Land added successfully',
                'land_id' => $newLandRef->getKey(),
                'land' => $landData
            ]);
            break;

        case 'PUT':
            // Update existing land - requires land ID in query string
            if (!$landId) {
                throw new Exception('Land ID required as query parameter (id=LAND_ID)', 400);
            }

            $landRef = $database->getReference('lands/' . $landId);
            $land = $landRef->getValue();
            
            if (!$land) {
                throw new Exception('Land not found', 404);
            }

            $input = json_decode(file_get_contents('php://input'), true);
            if ($input === null && json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Invalid JSON input', 400);
            }

            $updatableFields = ['name', 'province', 'district', 'size', 'coordinates', 'description', 'status', 'document_url'];
            $updateData = [];

            foreach ($updatableFields as $field) {
                if (isset($input[$field])) {
                    $updateData[$field] = $field === 'size' ? (float)$input[$field] : $input[$field];
                }
            }

            if (empty($updateData)) {
                throw new Exception('No fields to update', 400);
            }

            $landRef->update($updateData);
            
            http_response_code(200);
            echo json_encode([
                'message' => 'Land updated successfully',
                'land_id' => $landId
            ]);
            break;

        case 'DELETE':
            // Delete land - requires land ID in query string
            if (!$landId) {
                throw new Exception('Land ID required as query parameter (id=LAND_ID)', 400);
            }

            $landRef = $database->getReference('lands/' . $landId);
            $land = $landRef->getValue();
            
            if (!$land) {
                throw new Exception('Land not found', 404);
            }

            $landRef->remove();
            
            http_response_code(200);
            echo json_encode([
                'message' => 'Land deleted successfully',
                'land_id' => $landId
            ]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }

} catch (Exception $e) {
    $statusCode = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400;
    http_response_code($statusCode);
    echo json_encode(['error' => $e->getMessage()]);
}

// Reuse the getBearerToken function from the first file
function getBearerToken() {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
            return $matches[1];
        }
    }
    return null;
}