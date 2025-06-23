<?php
require __DIR__ . '/../../config.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Public endpoint to get all farmers
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['public']) && $_GET['public'] === 'all_farmers') {
    try {
        $farmersRef = $database->getReference('farmers');
        $allFarmers = $farmersRef->getValue();
        
        if (!$allFarmers) {
            throw new Exception('No farmers found');
        }
        
        $publicFarmersData = [];
        foreach ($allFarmers as $uid => $farmer) {
            if (is_array($farmer)) {
                unset($farmer['password']);
                unset($farmer['tokens']);
                $publicFarmersData[] = $farmer;
            }
        }
        
        http_response_code(200);
        echo json_encode($publicFarmersData);
        exit;
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()]);
        exit;
    }
}

// Public DELETE endpoint (INSECURE - USE WITH CAUTION)
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && isset($_GET['delete_user'])) {
    $userId = $_GET['delete_user'];
    
    if (empty($userId)) {
        http_response_code(400);
        echo json_encode(['error' => 'User ID is required']);
        exit;
    }

    try {
        $farmerRef = $database->getReference('farmers/' . $userId);
        $farmerRef->remove(); // Delete user from Firebase
        
        http_response_code(200);
        echo json_encode(['message' => 'User deleted successfully']);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete user: ' . $e->getMessage()]);
        exit;
    }
}

// Private endpoints (require token)
$token = getBearerToken();
if (!$token) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

try {
    $verifiedIdToken = $auth->verifyIdToken($token);
    $uid = $verifiedIdToken->claims()->get('sub');
    
    $farmerRef = $database->getReference('farmers/' . $uid);
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $profile = $farmerRef->getValue();
        if (!$profile) {
            throw new Exception('Profile not found');
        }
        unset($profile['password']);
        http_response_code(200);
        echo json_encode($profile);
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        if ($input === null) {
            throw new Exception('Invalid JSON input');
        }
        $allowedFields = ['full_name', 'phone', 'address', 'language'];
        $updates = [];
        foreach ($allowedFields as $field) {
            if (isset($input[$field])) {
                $updates[$field] = $input[$field];
            }
        }
        if (!empty($updates)) {
            $farmerRef->update($updates);
        }
        http_response_code(200);
        echo json_encode(['message' => 'Profile updated successfully']);
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