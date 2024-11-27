<?php
// Database connection
require 'db_connect.php'; // Make sure this file contains your DB connection code

header('Content-Type: application/json');

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

$username = $input['username'] ?? '';
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

// Input validation: Ensure all fields are provided
if (empty($username) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format.']);
    exit;
}

// Password strength check (optional): e.g., at least 8 characters, including a number and special character
if (strlen($password) < 8 || !preg_match('/[A-Za-z]/', $password) || !preg_match('/\d/', $password)) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters long and contain both letters and numbers.']);
    exit;
}

// Check if email or username already exists
$stmt = $conn->prepare("SELECT * FROM users WHERE username = ? OR email = ?");
$stmt->bind_param("ss", $username, $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Username or email already taken.']);
    exit;
}

// Hash the password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insert new user into the database
$stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $username, $email, $hashedPassword);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Sign Up successful!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error signing up. Please try again later.']);
}

$stmt->close();
$conn->close();
?>
