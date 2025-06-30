<?php
require __DIR__ . '/../config.php';

// Set CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With");
header("Access-Control-Max-Age: 3600");
header("Content-Type: application/json");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Create uploads directory if it doesn't exist
$uploadDir = __DIR__ . '/../uploads/';
if (!file_exists($uploadDir)) {
    if (!mkdir($uploadDir, 0777, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create upload directory']);
        exit;
    }
}

// Main POST handling
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        if (!isset($_FILES['files'])) {
            throw new Exception('No files uploaded');
        }

        // Normalize single vs multiple file uploads
        $normalizedFiles = [];

        if (is_array($_FILES['files']['name'])) {
            // Multiple files
            foreach ($_FILES['files']['name'] as $index => $name) {
                $normalizedFiles[] = [
                    'name' => $_FILES['files']['name'][$index],
                    'type' => $_FILES['files']['type'][$index],
                    'tmp_name' => $_FILES['files']['tmp_name'][$index],
                    'error' => $_FILES['files']['error'][$index],
                    'size' => $_FILES['files']['size'][$index]
                ];
            }
        } else {
            // Single file
            $normalizedFiles[] = $_FILES['files'];
        }

        $filePaths = [];
        $baseUrl = 'http://localhost/firebase-auth'; // Base URL for the file paths

        foreach ($normalizedFiles as $file) {
            // Validate size
            if ($file['size'] > 10 * 1024 * 1024) {
                throw new Exception('File size exceeds 10MB limit');
            }

            // Validate type
            $allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];
            
            if (!in_array($file['type'], $allowedTypes)) {
                throw new Exception('Invalid file type. Only images (JPEG, PNG, GIF) and documents (PDF, DOC, DOCX) allowed');
            }

            // Save file
            $fileName = basename($file['name']);
            $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            $newFileName = uniqid() . '_' . bin2hex(random_bytes(8)) . '.' . $fileExt;
            $filePath = $uploadDir . $newFileName;

            if (move_uploaded_file($file['tmp_name'], $filePath)) {
                // Return full URL with correct base path
                $filePaths[] = $baseUrl . '/uploads/' . $newFileName;
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

// Method not allowed
http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);