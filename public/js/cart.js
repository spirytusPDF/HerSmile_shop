document.addEventListener("DOMContentLoaded", () => {
    const cartBtn = document.getElementById("cartBtn");
    const cartModal = document.getElementById("cartModal");
    const closeCartModal = document.getElementById("closeCartModal");
    const cartModalContent = document.getElementById("cartModalContent");

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

    window.openAndLoadCart = async function(userId) {
        try {
            const response = await fetch(`/api/cart/${userId}`);
            let cartData = { items: [] };
            if (response.ok) {
                cartData = await response.json();
            }

            if (cartModal) {
                cartModal.classList.add("active");
            }
            renderCartContent(cartData);
        } catch (err) {
            console.error(err);
        }
    };

    if (cartBtn) {
        cartBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            const user = getCurrentUser();

            if (!user) {
                alert("Please sign in first to add items to your cart or view it.");
                const authModal = document.getElementById("authModal");
                if (authModal) {
                    authModal.classList.add("active");
                }
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

        let itemsHtml = cart.items.map(item => {
            const title = item.product ? item.product.name : `Product ID: ${item.productId}`;
            const price = item.product ? `$${item.product.price}` : "";
            const image = item.product && item.product.image ? item.product.image : "";

            return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee; gap: 15px;">
                    ${image ? `<img src="${image}" alt="${title}" style="width: 50px; height: 50px; object-fit: contain; background: #f9f9f9; border-radius: 4px;">` : ''}
                    <div style="flex-grow: 1;">
                        <div style="font-weight: 600; font-size: 14px; color: #111;">${title}</div>
                    </div>
                    <span style="font-weight: bold; color: #6A0809;">${price}</span>
                </div>
            `;
        }).join('');

        cartModalContent.innerHTML = `
            <div style="max-height: 320px; overflow-y: auto; margin-bottom: 20px; padding-right: 5px;">
                ${itemsHtml}
            </div>
            <button class="auth-submit-btn" id="checkoutBtn" style="width: 100%;">Proceed to Checkout</button>
        `;
    }
});