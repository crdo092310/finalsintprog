// Function to add product to the cart using AJAX
function addToCart(productName, price, image) {
    const product = {
        id: new Date().getTime(), // Unique ID based on timestamp (for example purposes)
        name: productName,
        price: price,
        image: image,
        quantity: 1
    };

    // AJAX request to add item to cart
    fetch('cart.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'add', // Action to indicate adding an item
            product: product
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert(`${productName} has been added to your cart!`);
            loadCart(); // Reload the cart items after adding
        } else {
            alert('Error adding product to cart.');
        }
    })
    .catch(error => {
        console.error("Error adding to cart:", error);
    });
}

// Function to load cart items using AJAX
function loadCart() {
    // Fetch cart items from the server
    fetch('cart.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'load' // Action to load cart items
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            displayCartItems(result.cartItems); // Display cart items
        } else {
            alert('Error loading cart.');
        }
    })
    .catch(error => {
        console.error("Error loading cart:", error);
    });
}

// Function to display cart items
function displayCartItems(cartItems) {
    let cartHTML = '';
    let subtotal = 0;
    
    cartItems.forEach(item => {
        let itemSubtotal = item.price * item.quantity;
        subtotal += itemSubtotal;

        cartHTML += `
            <tr data-id="${item.id}">
                <td><button class="remove-item">Remove</button></td>
                <td><img src="${item.image}" alt="${item.name}" class="cart-item-image"></td>
                <td>${item.name}</td>
                <td>₱${item.price}</td>
                <td><input type="number" class="quantity" value="${item.quantity}" min="1"></td>
                <td class="item-subtotal">₱${itemSubtotal}</td>
            </tr>
        `;
    });

    document.getElementById('cart-items').innerHTML = cartHTML;
    updateCartTotal(); // Update the total after loading the cart
}

// Function to handle remove item using AJAX
document.getElementById('cart-items').addEventListener('click', function (event) {
    if (event.target.classList.contains('remove-item')) {
        const row = event.target.closest('tr');
        const itemId = row.dataset.id;

        // AJAX request to remove item from cart
        fetch('cart.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'remove', // Action to indicate removing an item
                itemId: itemId
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                row.remove(); // Remove the item from the DOM
                updateCartTotal(); // Recalculate the total
            } else {
                alert('Error removing item from cart.');
            }
        })
        .catch(error => {
            console.error("Error removing item:", error);
        });
    }
});

// Function to handle quantity change using AJAX
document.getElementById('cart-items').addEventListener('change', function (event) {
    if (event.target.classList.contains('quantity')) {
        const row = event.target.closest('tr');
        const itemId = row.dataset.id;
        const quantity = parseInt(event.target.value);

        if (isNaN(quantity) || quantity <= 0) {
            return; // Don't update if the quantity is invalid
        }

        // AJAX request to update item quantity
        fetch('cart.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update', // Action to indicate updating the quantity
                itemId: itemId,
                quantity: quantity
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                // Update the item subtotal
                const price = parseFloat(row.querySelector('td:nth-child(4)').innerText.replace('₱', ''));
                const newSubtotal = price * quantity;
                row.querySelector('.item-subtotal').innerText = `₱${newSubtotal}`;
                updateCartTotal(); // Recalculate the total
            } else {
                alert('Error updating quantity.');
            }
        })
        .catch(error => {
            console.error("Error updating quantity:", error);
        });
    }
});

// Function to update the cart total
function updateCartTotal() {
    let total = 0;
    document.querySelectorAll('#cart-items tr').forEach(row => {
        const subtotal = parseFloat(row.querySelector('.item-subtotal').innerText.replace('₱', ''));
        total += subtotal;
    });

    document.getElementById('cart-subtotal').innerText = `₱${total}`;
    document.getElementById('cart-total').innerText = `₱${total}`; // Update the total
}

// Call loadCart function to load cart items when page loads
document.addEventListener("DOMContentLoaded", function() {
    loadCart();
});
document.addEventListener("DOMContentLoaded", function () {
    // Get elements for checkout modal and button
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutForm = document.getElementById('checkout-form');

    // Open the modal when the checkout button is clicked
    checkoutBtn.addEventListener('click', function () {
        checkoutModal.style.display = 'block'; // Show the modal
    });

    // Close the modal if the user clicks outside of it
    window.addEventListener('click', function (event) {
        if (event.target == checkoutModal) {
            checkoutModal.style.display = 'none'; // Close the modal
        }
    });

    // Handle the form submission
    checkoutForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent form submission (we'll handle it with JavaScript)

        // Get the form data
        const name = document.getElementById('name').value;
        const address = document.getElementById('address').value;
        const phone = document.getElementById('phone').value;
        const instructions = document.getElementById('instructions').value;

        // Basic validation to make sure all fields are filled
        if (!name || !address || !phone) {
            alert('Please fill in all required fields.');
            return;
        }

        // Display a confirmation message with order details
        alert(`Order Submitted Successfully!\n\nName: ${name}\nAddress: ${address}\nPhone: ${phone}\nInstructions: ${instructions}`);

        // Clear the cart (optional, if you want to empty the cart after the order)
        localStorage.removeItem('cart');

        // Optionally, you can reload the cart to reflect the empty cart
        loadCart();  // Function to reload cart content (you already have this in your code)

        // Close the modal after submission
        checkoutModal.style.display = 'none';
    });

    // Function to reload the cart items (if needed)
    function loadCart() {
        const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        let cartHTML = '';
        let subtotal = 0;
        cartItems.forEach(item => {
            let itemSubtotal = item.price * item.quantity;
            subtotal += itemSubtotal;

            cartHTML += `
                <tr data-id="${item.id}">
                    <td><button class="remove-item">Remove</button></td>
                    <td><img src="${item.image}" alt="${item.name}"></td>
                    <td>${item.name}</td>
                    <td>₱${item.price}</td>
                    <td><input type="number" class="quantity" value="${item.quantity}" min="1"></td>
                    <td class="item-subtotal">₱${itemSubtotal}</td>
                </tr>
            `;
        });

        document.getElementById('cart-items').innerHTML = cartHTML;
        updateCartTotal(); // Update the total after loading the cart
    }

    // Function to update cart total
    function updateCartTotal() {
        let total = 0;
        document.querySelectorAll('#cart-items tr').forEach(row => {
            const subtotal = parseFloat(row.querySelector('.item-subtotal').innerText.replace('₱', ''));
            total += subtotal;
        });

        document.getElementById('cart-subtotal').innerText = `₱${total}`;
        document.getElementById('cart-total').innerText = `₱${total}`;
    }
});
document.addEventListener("DOMContentLoaded", function () {
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutForm = document.getElementById('checkout-form');
    const thankYouMessage = document.getElementById('thank-you-message'); // The Thank You message container

    // Open the modal when the checkout button is clicked
    checkoutBtn.addEventListener('click', function () {
        checkoutModal.style.display = 'block'; // Show the modal
    });

    // Close the modal if the user clicks outside of it
    window.addEventListener('click', function (event) {
        if (event.target == checkoutModal) {
            checkoutModal.style.display = 'none'; // Close the modal
        }
    });

    // Handle the form submission
    checkoutForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent form submission (we'll handle it with JavaScript)

        // Get the form data
        const name = document.getElementById('name').value;
        const address = document.getElementById('address').value;
        const phone = document.getElementById('phone').value;
        const instructions = document.getElementById('instructions').value;

        // Basic validation to make sure all fields are filled
        if (!name || !address || !phone) {
            alert('Please fill in all required fields.');
            return;
        }

        // Hide the modal and show the Thank You message
        checkoutModal.style.display = 'none';
        thankYouMessage.style.display = 'block';

        // Update the Thank You message with the details
        document.getElementById('thank-you-message-name').innerText = name;
        document.getElementById('thank-you-message-address').innerText = address;
        document.getElementById('thank-you-message-phone').innerText = phone;
        document.getElementById('thank-you-message-instructions').innerText = instructions || "No special instructions.";

        // Optionally, clear the cart after checkout
        localStorage.removeItem('cart');

        // Reload the cart (to reflect the empty cart)
        loadCart();  // Function to reload the cart content (you already have this in your code)
    });

    // Function to reload the cart items (if needed)
    function loadCart() {
        const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        let cartHTML = '';
        let subtotal = 0;
        cartItems.forEach(item => {
            let itemSubtotal = item.price * item.quantity;
            subtotal += itemSubtotal;

            cartHTML += `
                <tr data-id="${item.id}">
                    <td><button class="remove-item">Remove</button></td>
                    <td><img src="${item.image}" alt="${item.name}"></td>
                    <td>${item.name}</td>
                    <td>₱${item.price}</td>
                    <td><input type="number" class="quantity" value="${item.quantity}" min="1"></td>
                    <td class="item-subtotal">₱${itemSubtotal}</td>
                </tr>
            `;
        });

        document.getElementById('cart-items').innerHTML = cartHTML;
        updateCartTotal(); // Update the total after loading the cart
    }

    // Function to update cart total
    function updateCartTotal() {
        let total = 0;
        document.querySelectorAll('#cart-items tr').forEach(row => {
            const subtotal = parseFloat(row.querySelector('.item-subtotal').innerText.replace('₱', ''));
            total += subtotal;
        });

        document.getElementById('cart-subtotal').innerText = `₱${total}`;
        document.getElementById('cart-total').innerText = `₱${total}`;
    }
});
document.addEventListener("DOMContentLoaded", function () {
    const defaultLocation = [14.676041, 121.043700]; // Default: Metro Manila
    const map = L.map('map').setView(defaultLocation, 12);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add draggable marker
    let marker = L.marker(defaultLocation, { draggable: true }).addTo(map);

    // Update hidden inputs when marker is moved
    marker.on('moveend', function (event) {
        const position = marker.getLatLng();
        document.getElementById('latitude').value = position.lat;
        document.getElementById('longitude').value = position.lng;
    });

    // Set marker position on map click
    map.on('click', function (event) {
        const { lat, lng } = event.latlng;
        marker.setLatLng([lat, lng]);
        document.getElementById('latitude').value = lat;
        document.getElementById('longitude').value = lng;
    });

    // Geolocation: Pin current location
    document.getElementById('use-my-location').addEventListener('click', function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    const { latitude, longitude } = position.coords;
                    map.setView([latitude, longitude], 15); // Center the map
                    marker.setLatLng([latitude, longitude]); // Move the marker
                    document.getElementById('latitude').value = latitude;
                    document.getElementById('longitude').value = longitude;
                },
                function (error) {
                    alert("Unable to retrieve your location. Please check your permissions.");
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    });
});
