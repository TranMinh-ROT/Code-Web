// Global variables
let cart = [];
let currentItem = null;
let customerName = '';
//thêm vào
const API_URL = 'http://localhost:3000/api';
// Show name modal on every page load
window.onload = function() {
    document.getElementById('nameModal').style.display = 'block';
    updateCartCount();
}

// Save customer name
async function saveName() {
    const nameInput = document.getElementById('customerName');
    if (nameInput.value.trim()) {
        try {
            const response = await axios.post(`${API_URL}/customers`, {
                name: nameInput.value.trim()
            });
            
            customerId = response.data.id;
            customerName = response.data.name;
            
            document.getElementById('nameModal').style.display = 'none';
            updateWelcomeMessage();
            
            showNotification(`Chào mừng ${customerName}`);
        } catch (error) {
            console.error('Chi tiết lỗi:', error);
            alert('Lỗi khi lưu thông tin: ${error.message}');
        }
    }
}

// Update welcome message
function updateWelcomeMessage() {
    const welcomeMessage = document.getElementById('welcome-message');
    welcomeMessage.innerHTML = `
        <i class="fas fa-user-circle"></i>
        Xin chào khách hàng ${customerName}!
    `;
}

// Show menu sections
function showMenu(type) {
    // Hide all menu sections
    document.querySelectorAll('.menu-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected menu section
    const menuSection = document.getElementById(`${type}-menu`);
    menuSection.classList.add('active');

    // Scroll to menu section
    menuSection.scrollIntoView({ behavior: 'smooth' });
}

// Show order modal
function showOrderModal(itemName, price, type) {
    currentItem = {
        name: itemName,
        price: price,
        type: type
    };
    
    document.getElementById('modal-item-name').textContent = itemName;
    document.getElementById('modal-item-price').textContent = `${price.toLocaleString()}đ`;
    document.getElementById('quantity').value = 1;
    document.getElementById('note').value = '';
    document.getElementById('orderModal').style.display = 'block';
}

// Close order modal
function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
    currentItem = null;
}

// Quantity handlers
function increaseQuantity() {
    const quantityInput = document.getElementById('quantity');
    quantityInput.value = parseInt(quantityInput.value) + 1;
}

function decreaseQuantity() {
    const quantityInput = document.getElementById('quantity');
    if (parseInt(quantityInput.value) > 1) {
        quantityInput.value = parseInt(quantityInput.value) - 1;
    }
}

// Add to cart
function addToCart() {
    if (!currentItem) return;

    const quantity = parseInt(document.getElementById('quantity').value);
    const note = document.getElementById('note').value;

    const cartItem = {
        ...currentItem,
        quantity: quantity,
        note: note,
        total: currentItem.price * quantity,
        id: Date.now() // Unique identifier for each item
    };

    cart.push(cartItem);
    updateCartCount();
    closeOrderModal();
    
    // Show notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        Đã thêm ${quantity} ${cartItem.name} vào giỏ hàng!
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Update cart count
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Update cart count and add floating cart if items exist
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Add floating cart button if there are items
    let floatingCart = document.querySelector('.floating-cart');
    if (totalItems > 0) {
        if (!floatingCart) {
            floatingCart = document.createElement('button');
            floatingCart.className = 'floating-cart';
            floatingCart.innerHTML = `
                <i class="fas fa-shopping-cart"></i>
                <span>${totalItems}</span>
            `;
            floatingCart.onclick = showCart;
            document.body.appendChild(floatingCart);
        } else {
            floatingCart.querySelector('span').textContent = totalItems;
        }
    } else if (floatingCart) {
        floatingCart.remove();
    }
}

// Show cart
function showCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    // Clear current cart display
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Giỏ hàng trống</p>
            </div>
        `;
    } else {
        // Add each item to cart display
        cart.forEach((item) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.innerHTML = `
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p>Số lượng: ${item.quantity}</p>
                    ${item.note ? `<p class="cart-item-note">Ghi chú: ${item.note}</p>` : ''}
                    <p>Thành tiền: ${item.total.toLocaleString()}đ</p>
                </div>
                <div class="remove-item" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </div>
            `;
            cartItems.appendChild(itemDiv);
        });
    }
    
    // Calculate and display total
    const total = cart.reduce((sum, item) => sum + item.total, 0);
    cartTotal.innerHTML = `
        <div class="cart-summary">
            <span>Tổng cộng:</span>
            <span class="total-amount">${total.toLocaleString()}đ</span>
        </div>
    `;
    
    // Show cart modal with animation
    const cartModal = document.getElementById('cartModal');
    cartModal.style.display = 'block';
    setTimeout(() => {
        cartModal.querySelector('.modal-content').style.opacity = '1';
        cartModal.querySelector('.modal-content').style.transform = 'translateY(0)';
    }, 10);
}

// Close cart
function closeCart() {
    const cartModal = document.getElementById('cartModal');
    cartModal.querySelector('.modal-content').style.opacity = '0';
    cartModal.querySelector('.modal-content').style.transform = 'translateY(20px)';
    setTimeout(() => {
        cartModal.style.display = 'none';
    }, 300);
}

// Remove item from cart
function removeFromCart(itemId) {
    const index = cart.findIndex(item => item.id === itemId);
    if (index !== -1) {
        const removedItem = cart[index];
        cart.splice(index, 1);
        updateCartCount();
        showCart();

        // Show removal notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-trash"></i>
            Đã xóa ${removedItem.name} khỏi giỏ hàng
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Xác nhận đặt hàng
async function confirmOrder() {
    if (cart.length === 0) {
        alert('Giỏ hàng trống!');
        return; 
    }

    try {
        const response = await axios.post(`${API_URL}/orders`, {
            customerId: customerId,
            items: cart,
            totalAmount: cart.reduce((sum, item) => sum + item.total, 0)
        });

        // Reset giỏ hàng
        cart = [];
        updateCartCount();
        closeCart();

        showNotification('Đặt món thành công!');
        
    } catch (error) {
        alert('Lỗi khi đặt món');
    }
}

// Hiển thị thông báo
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--gradient-primary);
        color: white;
        padding: 1rem 2rem;
        border-radius: 50px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        z-index: 1100;
        animation: slideIn 0.3s ease-out;
    }

    .notification.success {
        background: linear-gradient(135deg, #28a745, #20c997);
    }

    .floating-cart {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--gradient-primary);
        color: white;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        z-index: 1000;
        transition: all 0.3s ease;
    }

    .floating-cart span {
        position: absolute;
        top: -5px;
        right: -5px;
        background: white;
        color: var(--primary-color);
        width: 25px;
        height: 25px;
        border-radius: 50%;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
    }

    .floating-cart:hover {
        transform: scale(1.1);
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .empty-cart {
        text-align: center;
        padding: 2rem;
        color: #666;
    }

    .empty-cart i {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: #ddd;
    }
`;
document.head.appendChild(style);

// Window click event to close modals
window.onclick = function(event) {
    const cartModal = document.getElementById('cartModal');
    const orderModal = document.getElementById('orderModal');
    const nameModal = document.getElementById('nameModal');
    
    if (event.target === cartModal) {
        closeCart();
    } else if (event.target === orderModal) {
        closeOrderModal();
    }
}

// Prevent closing name modal by clicking outside
document.querySelector('#nameModal .modal-content').onclick = function(event) {
    event.stopPropagation();
}
