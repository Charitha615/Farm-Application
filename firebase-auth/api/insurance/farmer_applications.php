<?php
require __DIR__ . '/../../config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Check if farmer_id is provided
    if (!isset($_GET['farmer_id']) || empty($_GET['farmer_id'])) {
        throw new Exception('Farmer ID is required');
    }

    $farmerId = $_GET['farmer_id'];
    $applicationsRef = $database->getReference('insurance_applications');
    $allApplications = $applicationsRef->getValue() ?: [];
    
    $farmerApplications = [];
    
    foreach ($allApplications as $appId => $application) {
        if (isset($application['farmer_id']) && $application['farmer_id'] === $farmerId) {
            $farmerApplications[$appId] = $application;
        }
    }
    
    http_response_code(200);
    echo json_encode($farmerApplications);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}