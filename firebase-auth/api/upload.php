<?php
require __DIR__ . '/../../config.php';

// Set CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With");
header("Access-Control-Max-Age: 3600");
header("Content-Type: application/json");

// Allow preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Create uploads directory if it doesn't exist
$uploadDir = __DIR__ . '/../../uploads/';
if (!file_exists($uploadDir)) {
    if (!mkdir($uploadDir, 0777, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create upload directory']);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        if (!isset($_FILES['files'])) {
            throw new Exception('No files uploaded');
        }

        $filePaths = [];
        foreach ($_FILES['files']['tmp_name'] as $key => $tmpName) {
            // Validate file
            $fileSize = $_FILES['files']['size'][$key];
            $fileType = $_FILES['files']['type'][$key];
            
            if ($fileSize > 10 * 1024 * 1024) { // 10MB limit
                throw new Exception('File size exceeds 10MB limit');
            }
            
            if (!preg_match('/^image\/(jpeg|png|gif)|video\/(mp4|mov)$/', $fileType)) {
                throw new Exception('Invalid file type. Only images (JPEG, PNG, GIF) and videos (MP4, MOV) are allowed');
            }

            // Generate safe filename
            $fileName = basename($_FILES['files']['name'][$key]);
            $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            $newFileName = uniqid() . '_' . bin2hex(random_bytes(8)) . '.' . $fileExt;
            $filePath = $uploadDir . $newFileName;

            if (move_uploaded_file($tmpName, $filePath)) {
                $filePaths[] = '/uploads/' . $newFileName;
            } else {
                throw new Exception('Failed to move uploaded file');
            }
        }

        if (empty($filePaths)) {
            throw new Exception('No files were successfully uploaded');
        }

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'filePaths' => $filePaths,
            'message' => 'Files uploaded successfully'
        ]);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>