<?php
require __DIR__ . '/../../../config.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
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
    
    $landsRef = $database->getReference('lands')->orderByChild('farmer_uid')->equalTo($uid);
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // List all lands for this farmer
        $lands = $landsRef->getValue();
        
        http_response_code(200);
        echo json_encode($lands ?: []);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Add new land
        $input = json_decode(file_get_contents('php://input'), true);
        
        if ($input === null) {
            throw new Exception('Invalid JSON input');
        }
        
        $requiredFields = ['name', 'province', 'district', 'size'];
        foreach ($requiredFields as $field) {
            if (empty($input[$field])) {
                throw new Exception("Missing required field: $field");
            }
        }
        
        $landData = [
            'farmer_uid' => $uid,
            'name' => $input['name'],
            'province' => $input['province'],
            'district' => $input['district'],
            'size' => $input['size'],
            'created_at' => date('Y-m-d H:i:s'),
            'status' => 'active'
        ];
        
        // Optional fields
        if (!empty($input['coordinates'])) $landData['coordinates'] = $input['coordinates'];
        if (!empty($input['description'])) $landData['description'] = $input['description'];
        
        $newLandRef = $database->getReference('lands')->push($landData);
        
        http_response_code(201);
        echo json_encode([
            'message' => 'Land added successfully',
            'land_id' => $newLandRef->getKey()
        ]);
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