<?php
session_start();
header('Content-Type: application/json');

// Initialize an empty cart if it doesn't exist
if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'];

switch ($action) {
    case 'add':
        // Add a product to the cart
        $product = $data['product'];
        $_SESSION['cart'][] = $product;
        echo json_encode(['success' => true]);
        break;

    case 'load':
        // Return cart items to the client
        echo json_encode(['success' => true, 'cartItems' => $_SESSION['cart']]);
        break;

    case 'remove':
        // Remove a product from the cart
        $itemId = $data['itemId'];
        $_SESSION['cart'] = array_filter($_SESSION['cart'], function($item) use ($itemId) {
            return $item['id'] != $itemId;
        });
        $_SESSION['cart'] = array_values($_SESSION['cart']); // Reindex array
        echo json_encode(['success' => true]);
        break;

    case 'update':
        // Update product quantity in the cart
        $itemId = $data['itemId'];
        $quantity = $data['quantity'];

        foreach ($_SESSION['cart'] as &$item) {
            if ($item['id'] == $itemId) {
                $item['quantity'] = $quantity;
                break;
            }
        }
        echo json_encode(['success' => true]);
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}
?>
