<?php
require __DIR__ . '/vendor/autoload.php';

use Kreait\Firebase\Factory;
use Kreait\Firebase\Auth;
use Kreait\Firebase\Storage;

// Service account configuration
$serviceAccountPath = __DIR__ . '/serviceAccountKey.json';

// Initialize Firebase
$factory = (new Factory)
    ->withServiceAccount($serviceAccountPath)
    ->withDatabaseUri('https://php-backend-dd6d0-default-rtdb.firebaseio.com');

$auth = $factory->createAuth();
$database = $factory->createDatabase();
$storage = $factory->createStorage();

// Firebase Web Config (for client-side if needed)
$firebaseConfig = [
    'apiKey' => 'AIzaSyClUi3mSLbI_59sKW8amz6zfkzINrW8qcI',
    'authDomain' => 'php-backend-dd6d0.firebaseapp.com',
    'databaseURL' => 'https://php-backend-dd6d0-default-rtdb.firebaseio.com',
    'projectId' => 'php-backend-dd6d0',
    'storageBucket' => 'php-backend-dd6d0.appspot.com',
    'messagingSenderId' => 'YOUR_SENDER_ID',
    'appId' => '1:YOUR_APP_ID:web:YOUR_CLIENT_ID',
];

// Set headers for API responses
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Helper function to get input data
function getInputData() {
    return json_decode(file_get_contents('php://input'), true);
}
?>