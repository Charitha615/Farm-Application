<?php
require __DIR__ . '/../../config.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Verify JWT token
$token = null;
$headers = apache_request_headers();
if (isset($headers['Authorization'])) {
    $matches = [];
    preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches);
    if (isset($matches[1])) {
        $token = $matches[1];
    }
}

if (!$token || !$auth->verifyIdToken($token)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        if (!isset($_FILES['files'])) {
            throw new Exception('No files uploaded');
        }

        $uploadDir = __DIR__ . '/../../uploads/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $filePaths = [];
        foreach ($_FILES['files']['tmp_name'] as $key => $tmpName) {
            $fileName = basename($_FILES['files']['name'][$key]);
            $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            $newFileName = uniqid() . '.' . $fileExt;
            $filePath = $uploadDir . $newFileName;

            if (move_uploaded_file($tmpName, $filePath)) {
                $filePaths[] = '/uploads/' . $newFileName;
            }
        }

        if (empty($filePaths)) {
            throw new Exception('Failed to upload files');
        }

        http_response_code(200);
        echo json_encode(['filePaths' => $filePaths]);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>