<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Configuration
$uploadDir = 'tmp/uploads/';
$maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
$allowedTypes = [
    'image/jpeg',
    'image/png',
    'text/plain',
    'application/pdf'
];

// Response function
function sendResponse($success, $message, $data = null) {
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// Create upload directory if it doesn't exist
if (!file_exists($uploadDir)) {
    if (!mkdir($uploadDir, 0777, true)) {
        sendResponse(false, 'Failed to create upload directory');
    }
}

// Validate request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Only POST requests are allowed');
}

if (!isset($_FILES['file'])) {
    sendResponse(false, 'No file uploaded');
}

$file = $_FILES['file'];
$isRFSpectrum = isset($_POST['isRFSpectrum']) && $_POST['isRFSpectrum'] === 'true';

// Validate file size
if ($file['size'] > $maxFileSize) {
    sendResponse(false, 'File is too large. Maximum size is 10MB');
}

// Validate file type
if (!in_array($file['type'], $allowedTypes)) {
    sendResponse(false, 'File type not allowed');
}

// Generate safe filename
$fileInfo = pathinfo($file['name']);
$safeFilename = uniqid() . '_' . preg_replace('/[^a-zA-Z0-9\.]/', '_', $fileInfo['basename']);
$uploadPath = $uploadDir . $safeFilename;

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
    sendResponse(false, 'Failed to save file');
}

// Set file permissions
chmod($uploadPath, 0644);

// Schedule file deletion (after 1 hour)
$deleteAfter = time() + 3600; // 1 hour
file_put_contents($uploadDir . $safeFilename . '.delete', $deleteAfter);

// Return success response
sendResponse(true, 'File uploaded successfully', [
    'filename' => $safeFilename,
    'originalName' => $file['name'],
    'type' => $file['type'],
    'size' => $file['size'],
    'isRFSpectrum' => $isRFSpectrum,
    'path' => $uploadPath,
    'deleteAfter' => date('Y-m-d H:i:s', $deleteAfter)
]);

// Cleanup old files
$files = glob($uploadDir . '*');
foreach ($files as $file) {
    if (substr($file, -7) === '.delete') {
        $deleteTime = (int)file_get_contents($file);
        if (time() > $deleteTime) {
            $actualFile = substr($file, 0, -7);
            if (file_exists($actualFile)) {
                unlink($actualFile);
            }
            unlink($file);
        }
    }
}
?>
