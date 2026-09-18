(function () {
    const CITIES = [
        "Kyiv", "Kharkiv", "Odesa", "Dnipro", "Lviv", "Zaporizhzhia",
        "Kryvyi Rih", "Mykolaiv", "Mariupol", "Vinnytsia", "Kherson",
        "Poltava", "Chernihiv", "Cherkasy", "Sumy", "Zhytomyr",
        "Chernivtsi", "Rivne", "Ivano-Frankivsk", "Ternopil", "Lutsk",
        "Uzhhorod", "Khmelnytskyi", "Kropyvnytskyi"
    ];

    let overlay = null;
    let stepContainer = null;

    let state = {
        userId: null,
        cart: null,
        items: [],
        total: 0,
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        city: "",
        address: ""
    };

    function ensureModal() {
        if (overlay) return;

        overlay = document.createElement("div");
        overlay.className = "auth-modal-overlay checkout-overlay";
        overlay.id = "checkoutOverlay";

        const card = document.createElement("div");
        card.className = "auth-modal-card checkout-modal-card";

        const closeBtn = document.createElement("button");
        closeBtn.type = "button";
        closeBtn.className = "close-modal-btn";
        closeBtn.innerHTML = "&times;";
        closeBtn.addEventListener("click", closeCheckout);

        stepContainer = document.createElement("div");
        stepContainer.id = "checkoutStepContainer";

        card.appendChild(closeBtn);
        card.appendChild(stepContainer);
        overlay.appendChild(card);
        document.body.appendChild(overlay);

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closeCheckout();
        });
    }

    function closeCheckout() {
        if (overlay) overlay.classList.remove("active");
    }

    window.openCheckout = function (userId, cart, selectedProductIds) {
        const selectedSet = new Set(selectedProductIds.map(String));
        const items = (cart.items || []).filter(item => selectedSet.has(String(item.productId)));

        if (items.length === 0) {
            if (window.showToast) {
                window.showToast("Please select at least one item to pay for.", { type: "error" });
            }
            return;
        }

        state = {
            userId,
            cart,
            items,
            total: items.reduce((sum, it) => sum + (it.product ? it.product.price : 0), 0),
            firstName: "", lastName: "", phone: "", email: "", city: "", address: ""
        };

        ensureModal();
        overlay.classList.add("active");
        renderStepDetails();
    };

    function renderStepDetails() {
        const itemsHtml = state.items.map(item => {
            const title = item.product ? item.product.name : `Product #${item.productId}`;
            const price = item.product ? item.product.price : 0;
            const image = item.product && item.product.image ? item.product.image : "";
            return `
                <div class="checkout-order-item">
                    ${image ? `<img src="${image}" alt="${title}">` : ""}
                    <span class="checkout-order-item-name">${title}</span>
                    <span class="checkout-order-item-price">$${price}</span>
                </div>
            `;
        }).join("");

        stepContainer.innerHTML = `
            <div class="checkout-step-fade">
                <h2 class="checkout-step-title">Your Order</h2>
                <div class="checkout-order-list">${itemsHtml}</div>
                <div class="checkout-order-total">Total: $${state.total.toFixed(2)}</div>
                <div class="checkout-section-subtitle">Fill in your personal details</div>
                <form class="auth-form" id="checkoutDetailsForm" novalidate>
                    <div class="form-group">
                        <label>First name</label>
                        <input type="text" id="checkoutFirstName" placeholder="e.g. Anna" autocomplete="given-name">
                    </div>
                    <div class="form-group">
                        <label>Last name</label>
                        <input type="text" id="checkoutLastName" placeholder="e.g. Shevchenko" autocomplete="family-name">
                    </div>
                    <div class="form-group">
                        <label>Phone number</label>
                        <input type="text" id="checkoutPhone" placeholder="380XXXXXXXXX" autocomplete="tel">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="text" id="checkoutEmail" placeholder="you@example.com" autocomplete="email">
                    </div>
                    <div class="auth-error-box" id="checkoutDetailsError" style="display:none;"></div>
                    <button type="submit" class="auth-submit-btn">Next</button>
                </form>
            </div>
        `;

        document.getElementById("checkoutFirstName").value = state.firstName;
        document.getElementById("checkoutLastName").value = state.lastName;
        document.getElementById("checkoutPhone").value = state.phone;
        document.getElementById("checkoutEmail").value = state.email;

        const form = document.getElementById("checkoutDetailsForm");
        const errorBox = document.getElementById("checkoutDetailsError");

        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const firstName = document.getElementById("checkoutFirstName").value.trim();
            const lastName = document.getElementById("checkoutLastName").value.trim();
            const phone = document.getElementById("checkoutPhone").value.trim();
            const email = document.getElementById("checkoutEmail").value.trim();

            const nameRegex = /^[A-Za-z]+$/;
            const phoneRegex = /^380\d{9}$/;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!nameRegex.test(firstName)) {
                errorBox.textContent = "Please enter a valid first name using English letters only.";
                errorBox.style.display = "block";
                return;
            }
            if (!nameRegex.test(lastName)) {
                errorBox.textContent = "Please enter a valid last name using English letters only.";
                errorBox.style.display = "block";
                return;
            }
            if (!phoneRegex.test(phone)) {
                errorBox.textContent = "Please enter a valid phone number in the format 380XXXXXXXXX.";
                errorBox.style.display = "block";
                return;
            }
            if (!emailRegex.test(email)) {
                errorBox.textContent = "Please enter a valid email address.";
                errorBox.style.display = "block";
                return;
            }

            errorBox.style.display = "none";
            state.firstName = firstName;
            state.lastName = lastName;
            state.phone = phone;
            state.email = email;

            renderStepCity();
        });
    }

    function renderStepCity() {
        stepContainer.innerHTML = `
            <div class="checkout-step-fade">
                <h2 class="checkout-step-title">Where should we deliver?</h2>
                <form class="auth-form" id="checkoutCityForm" novalidate>
                    <div class="form-group checkout-city-wrapper">
                        <label>City</label>
                        <input type="text" id="checkoutCityInput" list="checkoutCitySuggestions" placeholder="Start typing your city" autocomplete="off">
                        <datalist id="checkoutCitySuggestions">
                            ${CITIES.map(c => `<option value="${c}"></option>`).join("")}
                        </datalist>
                    </div>
                    <div class="auth-error-box" id="checkoutCityError" style="display:none;"></div>
                    <button type="submit" class="auth-submit-btn">Next</button>
                </form>
            </div>
        `;

        document.getElementById("checkoutCityInput").value = state.city;

        const form = document.getElementById("checkoutCityForm");
        const errorBox = document.getElementById("checkoutCityError");

        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const cityRaw = document.getElementById("checkoutCityInput").value.trim();
            const match = CITIES.find(c => c.toLowerCase() === cityRaw.toLowerCase());

            if (!cityRaw || !match) {
                errorBox.textContent = "Please check if the city is written correctly.";
                errorBox.style.display = "block";
                return;
            }

            errorBox.style.display = "none";
            state.city = match;
            renderStepAddress();
        });
    }

    function renderStepAddress() {
        stepContainer.innerHTML = `
            <div class="checkout-step-fade">
                <h2 class="checkout-step-title">What's your address?</h2>
                <form class="checkout-address-center" id="checkoutAddressForm" novalidate>
                    <div class="form-group">
                        <label>Address</label>
                        <input type="text" id="checkoutAddressInput" placeholder="e.g. Shevchenka12" autocomplete="off">
                    </div>
                    <div class="auth-error-box" id="checkoutAddressError" style="display:none;"></div>
                    <button type="submit" class="auth-submit-btn checkout-place-order-btn">Place order</button>
                </form>
            </div>
        `;

        document.getElementById("checkoutAddressInput").value = state.address;

        const form = document.getElementById("checkoutAddressForm");
        const errorBox = document.getElementById("checkoutAddressError");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const address = document.getElementById("checkoutAddressInput").value.trim();

            if (!address || /\s/.test(address)) {
                errorBox.textContent = "Address must not contain spaces.";
                errorBox.style.display = "block";
                return;
            }

            errorBox.style.display = "none";
            state.address = address;

            const submitBtn = form.querySelector("button[type=submit]");
            submitBtn.disabled = true;
            submitBtn.textContent = "Placing order...";

            try {
                await performCheckout();
                renderSuccess();
            } catch (err) {
                console.error("Checkout failed:", err);
                errorBox.textContent = "Something went wrong while placing your order. Please try again.";
                errorBox.style.display = "block";
                submitBtn.disabled = false;
                submitBtn.textContent = "Place order";
            }
        });
    }

    async function performCheckout() {
        const allItems = state.cart.items || [];
        const selectedIds = new Set(state.items.map(item => String(item.productId)));
        const unselectedItems = allItems.filter(item => !selectedIds.has(String(item.productId)));

        // Stash the unselected items out of the cart so the full-cart
        // checkout endpoint only processes what the user actually selected.
        for (const item of unselectedItems) {
            await fetch("/api/cart/remove", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: state.userId, productId: item.productId })
            });
        }

        try {
            const res = await fetch("/api/orders/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: state.userId })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Checkout failed");
        } finally {
            // Always restore the unselected items, whether checkout succeeded or not.
            for (const item of unselectedItems) {
                await fetch("/api/cart/add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: state.userId, productId: item.productId })
                });
            }
        }
    }

    function renderSuccess() {
        stepContainer.innerHTML = `
            <div class="checkout-step-fade checkout-success-box">
                <div class="checkout-success-icon">✅</div>
                <h2 class="checkout-step-title">Order placed!</h2>
                <p class="checkout-success-text">
                    Thank you, ${state.firstName}! Our specialist will contact you within
                    the next hour to confirm your order details.
                </p>
                <button type="button" class="auth-submit-btn checkout-place-order-btn" id="checkoutDoneBtn" style="margin:0 auto;">Done</button>
            </div>
        `;

        document.getElementById("checkoutDoneBtn").addEventListener("click", () => {
            const finishedUserId = state.userId;
            closeCheckout();
            if (window.showToast) {
                window.showToast("Your order has been placed successfully!", { type: "success" });
            }
            if (window.openAndLoadCart) {
                window.openAndLoadCart(finishedUserId);
            }
        });
    }
})();