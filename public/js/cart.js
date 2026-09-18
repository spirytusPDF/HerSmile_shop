document.addEventListener("DOMContentLoaded", () => {
    const cartBtn = document.getElementById("cartBtn");
    const cartModal = document.getElementById("cartModal");
    const closeCartModal = document.getElementById("closeCartModal");
    const cartModalContent = document.getElementById("cartModalContent");

    let currentCart = { items: [] };
    let currentUserId = null;
    let selectMode = false;
    let selectedIds = new Set();

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

    function promptSignIn() {
        if (window.showToast) {
            window.showToast("Please sign in first to view or add items to your cart.", {
                type: "info",
                actionText: "Sign in",
                onAction: () => window.openAuthModal()
            });
        } else {
            window.openAuthModal();
        }
    }

    window.openAndLoadCart = async function (userId) {
        currentUserId = userId;
        selectMode = false;
        selectedIds = new Set();

        try {
            const response = await fetch(`/api/cart/${userId}`);
            let cartData = { items: [] };
            if (response.ok) {
                cartData = await response.json();
            }
            currentCart = cartData;

            if (cartModal) {
                cartModal.classList.add("active");
            }
            renderCartContent(currentCart);
        } catch (err) {
            console.error(err);
        }
    };

    if (cartBtn) {
        cartBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            const user = getCurrentUser();

            if (!user) {
                promptSignIn();
                return;
            }

            await window.openAndLoadCart(user.id);
        });
    }

    if (closeCartModal) {
        closeCartModal.addEventListener("click", () => {
            if (cartModal) cartModal.classList.remove("active");
        });
    }

    if (cartModal) {
        cartModal.addEventListener("click", (e) => {
            if (e.target === cartModal) {
                cartModal.classList.remove("active");
            }
        });
    }

    function toggleSelectMode() {
        selectMode = !selectMode;
        if (!selectMode) selectedIds = new Set();
        renderCartContent(currentCart);
    }

    async function handleDeleteSelected() {
        if (selectedIds.size === 0) {
            if (window.showToast) {
                window.showToast("Please select at least one item to delete.", { type: "error" });
            }
            return;
        }

        try {
            for (const productId of selectedIds) {
                await fetch("/api/cart/remove", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: currentUserId, productId })
                });
            }

            if (window.showToast) {
                window.showToast("Selected items were removed from your cart.", { type: "success" });
            }

            await window.openAndLoadCart(currentUserId);
        } catch (err) {
            console.error("Failed to delete cart items:", err);
            if (window.showToast) {
                window.showToast("Something went wrong while removing items.", { type: "error" });
            }
        }
    }

    function handlePaySelected() {
        if (selectedIds.size === 0) {
            if (window.showToast) {
                window.showToast("Please select at least one item to pay for.", { type: "error" });
            }
            return;
        }

        if (window.openCheckout) {
            window.openCheckout(currentUserId, currentCart, Array.from(selectedIds));
        }
    }

    function handleCheckoutAll() {
        const allIds = (currentCart.items || []).map(item => item.productId);
        if (allIds.length === 0) return;

        if (window.openCheckout) {
            window.openCheckout(currentUserId, currentCart, allIds);
        }
    }

    function renderCartContent(cart) {
        if (!cartModalContent) return;

        if (!cart.items || cart.items.length === 0) {
            cartModalContent.innerHTML = `
                <div style="text-align: center; padding: 20px 0;">
                    <div style="font-size: 40px; margin-bottom: 15px;">🛍️</div>
                    <h3 style="font-size: 20px; margin-bottom: 10px; font-weight: 600;">Your cart is empty</h3>
                    <p style="color: #666; font-size: 14px; margin-bottom: 25px;">Your shopping cart is empty. Add items to start shopping.</p>
                    <button class="auth-submit-btn" id="toShoppingBtn">Go to shopping</button>
                </div>
            `;

            document.getElementById("toShoppingBtn").addEventListener("click", () => {
                cartModal.classList.remove("active");
            });
            return;
        }

        const itemsHtml = cart.items.map(item => {
            const title = item.product ? item.product.name : `Product ID: ${item.productId}`;
            const price = item.product ? `$${item.product.price}` : "";
            const image = item.product && item.product.image ? item.product.image : "";
            const checked = selectedIds.has(item.productId) ? "checked" : "";

            return `
                <div class="cart-item-row" data-product-id="${item.productId}">
                    <input type="checkbox" class="cart-item-checkbox" data-product-id="${item.productId}" ${checked}>
                    ${image ? `<img class="cart-item-img" src="${image}" alt="${title}">` : ""}
                    <div class="cart-item-info">
                        <div class="cart-item-name">${title}</div>
                    </div>
                    <span class="cart-item-price">${price}</span>
                </div>
            `;
        }).join("");

        cartModalContent.innerHTML = `
            <div class="cart-header-row">
                <h3 class="cart-title">Your Cart</h3>
                <button type="button" class="cart-select-toggle-btn ${selectMode ? "active" : ""}" id="cartSelectToggleBtn">
                    ${selectMode ? "Cancel" : "Select"}
                </button>
            </div>
            <div class="cart-items-list ${selectMode ? "cart-modal-select-mode" : ""}" id="cartItemsList">
                ${itemsHtml}
            </div>
            <div class="cart-actions-bar ${selectMode ? "split" : ""}" id="cartActionsBar">
                <button class="cart-checkout-btn" id="cartCheckoutBtn">Proceed to Checkout</button>
                <button class="cart-delete-btn" id="cartDeleteBtn">Delete</button>
                <button class="cart-pay-btn" id="cartPayBtn">Pay</button>
            </div>
        `;

        document.getElementById("cartSelectToggleBtn").addEventListener("click", toggleSelectMode);
        document.getElementById("cartCheckoutBtn").addEventListener("click", handleCheckoutAll);
        document.getElementById("cartDeleteBtn").addEventListener("click", handleDeleteSelected);
        document.getElementById("cartPayBtn").addEventListener("click", handlePaySelected);

        document.querySelectorAll(".cart-item-checkbox").forEach(box => {
            box.addEventListener("change", (e) => {
                const productId = parseInt(e.target.getAttribute("data-product-id"), 10);
                if (e.target.checked) {
                    selectedIds.add(productId);
                } else {
                    selectedIds.delete(productId);
                }
            });
        });
    }
});