<?php
// Database connection
require 'db_connect.php'; // Make sure this file contains your DB connection code

header('Content-Type: application/json');

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

$usernameOrEmail = $input['usernameOrEmail'] ?? '';
$password = $input['password'] ?? '';

// Input validation: Check if username/email and password are provided
if (empty($usernameOrEmail) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Both username/email and password are required.']);
    exit;
}

// Check if the username or email exists in the database
$stmt = $conn->prepare("SELECT * FROM users WHERE username = ? OR email = ?");
$stmt->bind_param("ss", $usernameOrEmail, $usernameOrEmail);
$stmt->execute();
$result = $stmt->get_result();

// If no user is found
if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'User not found.']);
    exit;
}

$user = $result->fetch_assoc();

// Verify the password against the hash stored in the database
if (password_verify($password, $user['password'])) {
    // If successful, respond with success
    echo json_encode(['success' => true, 'message' => 'Sign-in successful.']);
} else {
    // If the password is incorrect
    echo json_encode(['success' => false, 'message' => 'Incorrect password.']);
}

$stmt->close();
$conn->close();
?>
