// Constants
const API_URL = 'http://localhost:3000/api';
let currentOrder = null;

// DOM Elements
const table = document.getElementById('table1');
const orderModal = document.getElementById('orderModal');
const orderDetails = document.getElementById('orderDetails');
const orderTotal = document.getElementById('orderTotal');

// Fetch orders periodically
function fetchOrders() {
    axios.get(`${API_URL}/orders/1`)
        .then(response => {
            if (response.data.length > 0) {
                // Lưu toàn bộ dữ liệu order
                currentOrder = response.data;
                updateTableStatus('active');
                console.log('Current order:', currentOrder); // For debugging
            } else {
                currentOrder = null;
                updateTableStatus('empty');
            }
        })
        .catch(error => {
            console.error('Error fetching orders:', error);
            currentOrder = null;
            updateTableStatus('empty');
        });
}

// Start periodic fetching
fetchOrders();
setInterval(fetchOrders, 30000); // Fetch every 30 seconds

// Update table status and appearance
function updateTableStatus(status) {
    table.className = 'table';
    
    switch(status) {
        case 'active':
            table.classList.add('active');
            break;
        case 'prepared':
            table.classList.add('prepared');
            break;
        default:
            // Default white background
            break;
    }
}

// Handle table click
function handleTableClick() {
    if (currentOrder) {
        showOrderDetails();
    } else {
        console.log('No active order for this table');
        // Có thể thêm thông báo cho người dùng
        showNotification('Chưa có danh sách món cho bàn này');
    }
}

// Show order details in modal
function showOrderDetails() {
    if (!currentOrder || currentOrder.length === 0) {
        console.log('No order details available');
        return;
    }

    orderDetails.innerHTML = '';
    let total = 0;

    // Loop through each item in the order
    currentOrder.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'order-item';
        itemDiv.innerHTML = `
            <h3>${item.item_name}</h3>
            <p>Số lượng: ${item.quantity}</p>
            <p>Giá: ${item.price.toLocaleString()}đ</p>
            ${item.note ? `<p>Ghi chú: ${item.note}</p>` : ''}
            <p>Loại: ${item.type || 'Không có'}</p>
        `;
        orderDetails.appendChild(itemDiv);
        total += item.price * item.quantity;
    });

    orderTotal.innerHTML = `Tổng cộng: ${total.toLocaleString()}đ`;
    orderModal.style.display = 'block';

    // For debugging
    console.log('Showing order details:', currentOrder);
    console.log('Total:', total);
}

// Close order modal
function closeOrderModal() {
    orderModal.style.display = 'none';
}

// Mark order as prepared
function markAsPrepared() {
    updateTableStatus('prepared');
    closeOrderModal();
}

// Mark order as paid
function markAsPaid() {
    if (currentOrder && currentOrder.length > 0) {
        const orderId = currentOrder[0].order_id;
        axios.delete(`${API_URL}/orders/${orderId}`)
            .then(() => {
                currentOrder = null;
                updateTableStatus('empty');
                closeOrderModal();
            })
            .catch(error => {
                console.error('Error marking order as paid:', error);
                alert('Có lỗi xảy ra khi xác nhận thanh toán');
            });
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target === orderModal) {
        closeOrderModal();
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
