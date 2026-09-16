document.addEventListener("DOMContentLoaded", () => {
    const ordersModal = document.getElementById("ordersModal");
    const closeOrdersModal = document.getElementById("closeOrdersModal");
    const ordersModalContent = document.getElementById("ordersModalContent");

    function getCurrentUser() {
        const userJson = localStorage.getItem("hersmile_current_user");
        if (!userJson) return null;
        try {
            return JSON.parse(userJson);
        } catch (e) {
            localStorage.removeItem("hersmile_current_user");
            return null;
        }
    }

    function formatDate(value) {
        if (!value) return "";
        const date = new Date(value);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function renderEmptyState() {
        ordersModalContent.innerHTML = `
            <div class="orders-empty">
                <div class="orders-empty-icon">📦</div>
                <h3 class="orders-empty-title">No orders yet</h3>
                <p class="orders-empty-text">Once you place your first order, it will appear here.</p>
            </div>
        `;
    }

    function renderOrders(orders) {
        const ordersHtml = orders.map(order => {
            const itemsHtml = (order.items || []).map(item => {
                const name = item.product ? item.product.name : `Product #${item.productId}`;
                const image = item.product && item.product.image ? item.product.image : "";
                return `
                    <li class="order-item">
                        ${image ? `<img class="order-item-img" src="${image}" alt="${name}">` : ''}
                        <span class="order-item-name">${name}</span>
                        <span class="order-item-price">$${item.price}</span>
                    </li>
                `;
            }).join('');

            return `
                <div class="order-card fade-in-card">
                    <div class="order-card-head">
                        <span class="order-number">Order #${order.id}</span>
                        <span class="order-date">${formatDate(order.createdAt)}</span>
                    </div>
                    <ul class="order-items-list">${itemsHtml}</ul>
                    <div class="order-total">Total: <strong>$${order.total}</strong></div>
                </div>
            `;
        }).join('');

        ordersModalContent.innerHTML = `<div class="orders-list">${ordersHtml}</div>`;
    }

    window.openOrderHistory = async function (userId) {
        if (!ordersModal || !ordersModalContent) return;

        ordersModalContent.innerHTML = `<p class="orders-loading">Loading your orders...</p>`;
        ordersModal.classList.add("active");

        try {
            const response = await fetch(`/api/orders/user/${userId}`);

            // бэкенд отдаёт 404 + { message } когда заказов ещё нет
            if (response.status === 404) {
                renderEmptyState();
                return;
            }

            if (!response.ok) {
                ordersModalContent.innerHTML = `<p class="orders-loading">Failed to load order history.</p>`;
                return;
            }

            const orders = await response.json();

            if (!Array.isArray(orders) || orders.length === 0) {
                renderEmptyState();
                return;
            }

            renderOrders(orders);
        } catch (err) {
            console.error("Failed to load orders:", err);
            ordersModalContent.innerHTML = `<p class="orders-loading">Server connection error.</p>`;
        }
    };

    if (closeOrdersModal) {
        closeOrdersModal.addEventListener("click", () => {
            ordersModal.classList.remove("active");
        });
    }

    if (ordersModal) {
        ordersModal.addEventListener("click", (e) => {
            if (e.target === ordersModal) {
                ordersModal.classList.remove("active");
            }
        });
    }

    // если страница открыта как /?orders — сразу показываем историю
    const params = new URLSearchParams(window.location.search);
    if (params.has("orders")) {
        const user = getCurrentUser();
        if (user) window.openOrderHistory(user.id);
    }
});