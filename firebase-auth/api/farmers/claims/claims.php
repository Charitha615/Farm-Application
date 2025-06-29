<?php
require __DIR__ . '/../../../config.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$claimsRef = $database->getReference('insurance_claims');
$notificationsRef = $database->getReference('notifications');

// Helper function to create notifications
function createNotification($database, $userId, $title, $message, $relatedEntity, $entityId) {
    $notificationRef = $database->getReference('notifications');
    $notificationRef->push()->set([
        'user_id' => $userId,
        'title' => $title,
        'message' => $message,
        'related_entity' => $relatedEntity,
        'related_entity_id' => $entityId,
        'is_read' => false,
        'created_at' => date('Y-m-d H:i:s'),
        'read_at' => null
    ]);
}

// GET claims (filter by farmer_id, status, or inspector_id if provided)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $claims = $claimsRef->getValue();
        
        if (!$claims) {
            $claims = [];
        }
        
        // Filter by farmer_id if provided
        if (isset($_GET['farmer_id'])) {
            $filteredClaims = [];
            foreach ($claims as $id => $claim) {
                if ($claim['farmer_id'] == $_GET['farmer_id']) {
                    $filteredClaims[$id] = $claim;
                }
            }
            $claims = $filteredClaims;
        }
        
        // Filter by status if provided
        if (isset($_GET['status'])) {
            $filteredClaims = [];
            foreach ($claims as $id => $claim) {
                if ($claim['status'] == $_GET['status']) {
                    $filteredClaims[$id] = $claim;
                }
            }
            $claims = $filteredClaims;
        }
        
        // Filter by inspector_id if provided
        if (isset($_GET['inspector_id'])) {
            $filteredClaims = [];
            foreach ($claims as $id => $claim) {
                if (isset($claim['inspector_id']) && $claim['inspector_id'] == $_GET['inspector_id']) {
                    $filteredClaims[$id] = $claim;
                }
            }
            $claims = $filteredClaims;
        }
        
        http_response_code(200);
        echo json_encode($claims);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// POST - Create new claim
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            throw new Exception('Invalid input data');
        }
        
        // Required fields validation
        $requiredFields = ['policy_id', 'farmer_id', 'land_id', 'damage_type', 'damage_date', 'description'];
        foreach ($requiredFields as $field) {
            if (!isset($input[$field])) {
                throw new Exception("Missing required field: $field");
            }
        }
        
        // Add additional fields with defaults
        $input['status'] = 'pending';
        $input['created_at'] = date('Y-m-d H:i:s');
        $input['updated_at'] = date('Y-m-d H:i:s');
        $input['evidence_files'] = $input['evidence_files'] ?? [];
        $input['weather_data'] = $input['weather_data'] ?? null;
        $input['inspection_report'] = null;
        $input['inspector_id'] = null;
        $input['notes'] = $input['notes'] ?? null;
        
        // Push to Firebase
        $newClaimRef = $claimsRef->push();
        $claimId = $newClaimRef->getKey();
        $newClaimRef->set($input);
        
        // Create notification for farmer
        createNotification(
            $database,
            $input['farmer_id'],
            'Claim Filed',
            'Your insurance claim has been filed successfully (Claim ID: ' . $claimId . ')',
            'claim',
            $claimId
        );
        
        // Create notification for admin (assuming admin has user_id = 'admin')
        createNotification(
            $database,
            'admin',
            'New Claim Filed',
            'A new insurance claim has been filed by farmer ID: ' . $input['farmer_id'],
            'claim',
            $claimId
        );
        
        http_response_code(201);
        echo json_encode([
            'message' => 'Claim filed successfully',
            'id' => $claimId
        ]);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// PUT - Update claim (status, inspection report, etc.)
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    try {
        if (!isset($_GET['id'])) {
            throw new Exception('Claim ID is required');
        }
        
        $claimId = $_GET['id'];
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            throw new Exception('Invalid input data');
        }
        
        // Get existing claim
        $claim = $claimsRef->getChild($claimId)->getValue();
        if (!$claim) {
            throw new Exception('Claim not found');
        }
        
        // Prepare updates
        $updates = [
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        // Status change notifications
        $statusMessages = [
            'approved' => [
                'title' => 'Claim Approved',
                'message' => 'Your claim has been approved'
            ],
            'rejected' => [
                'title' => 'Claim Rejected',
                'message' => 'Your claim has been rejected'
            ],
            'pending' => [
                'title' => 'Claim Status Changed',
                'message' => 'Your claim status has been set to pending'
            ],
            'under_review' => [
                'title' => 'Claim Under Review',
                'message' => 'Your claim is now under review'
            ]
        ];
        
        // Update status if provided
        if (isset($input['status']) && in_array($input['status'], ['approved', 'rejected', 'pending', 'under_review'])) {
            $updates['status'] = $input['status'];
            
            // Send notification if status changed
            if ($claim['status'] !== $input['status']) {
                createNotification(
                    $database,
                    $claim['farmer_id'],
                    $statusMessages[$input['status']]['title'],
                    $statusMessages[$input['status']]['message'],
                    'claim',
                    $claimId
                );
            }
        }
        
        // Add inspection report if provided
        if (isset($input['inspection_report'])) {
            $updates['inspection_report'] = $input['inspection_report'];
            
            // Notify farmer about new inspection report
            createNotification(
                $database,
                $claim['farmer_id'],
                'Inspection Report Added',
                'An inspection report has been added to your claim',
                'claim',
                $claimId
            );
        }
        
        // Add inspector if provided
        if (isset($input['inspector_id'])) {
            $updates['inspector_id'] = $input['inspector_id'];
            
            // Notify the assigned inspector
            createNotification(
                $database,
                $input['inspector_id'],
                'New Inspection Assigned',
                'You have been assigned to inspect claim ID: ' . $claimId,
                'claim',
                $claimId
            );
            
            // Notify farmer about inspector assignment
            createNotification(
                $database,
                $claim['farmer_id'],
                'Inspector Assigned',
                'An inspector has been assigned to your claim',
                'claim',
                $claimId
            );
        }
        
        // Add notes if provided
        if (isset($input['notes'])) {
            $updates['notes'] = $input['notes'];
        }
        
        // Update in Firebase
        $claimsRef->getChild($claimId)->update($updates);
        
        http_response_code(200);
        echo json_encode(['message' => 'Claim updated successfully']);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>