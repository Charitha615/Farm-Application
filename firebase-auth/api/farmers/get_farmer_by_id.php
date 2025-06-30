<?php
require __DIR__ . '/../../config.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Farmer ID is required']);
        exit;
    }

    $farmerId = $_GET['id'];

    try {
        $farmerRef = $database->getReference('farmers/' . $farmerId);
        $farmer = $farmerRef->getValue();

        if (!$farmer) {
            http_response_code(404);
            echo json_encode(['error' => 'Farmer not found']);
            exit;
        }

        // Remove sensitive info
        unset($farmer['password'], $farmer['tokens']);

        http_response_code(200);
        echo json_encode($farmer);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to retrieve farmer: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
