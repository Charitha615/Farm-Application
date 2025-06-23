<?php
require __DIR__ . '/../../../config.php';

// Set CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Verify token
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        throw new Exception('Authorization token required');
    }

    $token = str_replace('Bearer ', '', $headers['Authorization']);
    $verifiedToken = $auth->verifyIdToken($token);
    $uid = $verifiedToken->claims()->get('sub');
    
    // Get farmer data
    $farmer = $database->getReference('farmers/' . $uid)->getValue();
    if (!$farmer || ($farmer['role'] ?? null) !== 'farmer') {
        throw new Exception('Access restricted to farmers only');
    }
    
    // Process input
    $input = json_decode(file_get_contents('php://input'), true);
    if ($input === null && json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON input');
    }

    $requiredFields = ['name', 'province', 'district', 'size'];
    foreach ($requiredFields as $field) {
        if (empty($input[$field])) {
            throw new Exception("$field is required");
        }
    }
    
    // Handle file upload
    $documentUrl = null;
    if (!empty($_FILES['document'])) {
        $uploadDir = __DIR__ . '/../../../uploads/lands/';
        if (!file_exists($uploadDir)) {
            if (!mkdir($uploadDir, 0777, true)) {
                throw new Exception('Failed to create upload directory');
            }
        }
        
        $fileName = uniqid() . '_' . basename($_FILES['document']['name']);
        $targetPath = $uploadDir . $fileName;
        
        if (!move_uploaded_file($_FILES['document']['tmp_name'], $targetPath)) {
            throw new Exception('Failed to move uploaded file');
        }
        
        try {
            // Upload to Firebase Storage
            $storageClient = $storage->getBucket();
            $storagePath = 'lands/' . $uid . '/' . $fileName;
            $storageClient->upload(fopen($targetPath, 'r'), ['name' => $storagePath]);
            $documentUrl = $storageClient->object($storagePath)->signedUrl(new \DateTime('+10 years'));
            
            // Delete local file
            unlink($targetPath);
        } catch (Exception $e) {
            unlink($targetPath); // Clean up if upload fails
            throw new Exception('Failed to upload document: ' . $e->getMessage());
        }
    }
    
    // Create land record
    $landData = [
        'farmer_uid' => $uid,
        'name' => $input['name'],
        'province' => $input['province'],
        'district' => $input['district'],
        'size' => (float)$input['size'],
        'document_url' => $documentUrl,
        'created_at' => date('Y-m-d H:i:s'),
        'status' => 'active'
    ];
    
    $newLandRef = $database->getReference('lands')->push($landData);
    
    http_response_code(201);
    echo json_encode([
        'message' => 'Land added successfully',
        'land_id' => $newLandRef->getKey(),
        'land' => $landData
    ]);

} catch (\Kreait\Firebase\Exception\Auth\FailedToVerifyToken $e) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid or expired token']);
} catch (\Kreait\Firebase\Exception\Auth\UserNotFound $e) {
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}