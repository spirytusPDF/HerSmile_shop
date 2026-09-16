document.addEventListener("DOMContentLoaded", () => {
    const catalogContainer = document.getElementById("catalogContainer");
    const carouselContainer = document.querySelector(".carousel-container");

    async function loadCatalog(category) {
        if (!catalogContainer) return;

        if (carouselContainer) carouselContainer.style.display = category ? "none" : "block";

        try {
            const url = category
                ? `/api/products?category=${encodeURIComponent(category)}`
                : '/api/products';
            const response = await fetch(url);
            const products = await response.json();
            renderCatalog(products, category);
        } catch (err) {
            console.error("Failed to load products:", err);
        }
    }

    function renderCatalog(products, category) {
        const titleMap = { perfume: "Perfumes", makeup: "Makeup" };
        const title = category ? (titleMap[category] || category) : "Our Products";

        let gridHtml = products.map(product => `
            <div class="product-card" data-id="${product.id}" style="cursor: pointer; background: #fff; padding: 15px; border-radius: 4px; border: 1px solid #eee; transition: box-shadow 0.3s;">
                <div style="position: relative; height: 220px; display: flex; align-items: center; justify-content: center; background: #f9f9f9; margin-bottom: 12px;">
                    <img src="${product.image}" alt="${product.name}" style="max-height: 100%; max-width: 100%; object-fit: contain;">
                </div>
                <div style="font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 4px;">${product.brand}</div>
                <h3 style="font-size: 15px; font-weight: 600; margin-bottom: 8px; color: #111; line-height: 1.3;">${product.name}</h3>
                <div style="font-size: 16px; font-weight: bold; color: #d00; margin-bottom: 12px;">$${product.price}</div>
                <button class="quick-add-btn" data-id="${product.id}" style="width: 100%; background: #6A0809; color: #F4EFE0; border: none; padding: 8px; font-size: 13px; font-weight: bold; cursor: pointer; border-radius: 4px; text-transform: uppercase;">
                    Add to cart
                </button>
            </div>
        `).join('');

        if (products.length === 0) {
            gridHtml = `<p style="grid-column: 1/-1; text-align:center; color:#777;">No products found in this category.</p>`;
        }

        catalogContainer.style.display = "block";
        catalogContainer.style.width = "100%";

        catalogContainer.innerHTML = `
            <div style="max-width: 1200px; margin: 50px auto 0 auto; padding: 0 20px; width: 100%;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 30px;">
                    <h2 style="font-family: 'Playfair Display', serif; font-size: 32px; color: #111; margin: 0;">${title}</h2>
                    ${category ? `<button id="clearFilterBtn" style="background:none; border:1px solid #6A0809; color:#6A0809; padding:8px 16px; border-radius:20px; cursor:pointer; font-size:13px;">Show all</button>` : ''}
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 25px;">
                    ${gridHtml}
                </div>
            </div>
        `;

        if (category) {
            document.getElementById("clearFilterBtn").addEventListener("click", () => {
                history.pushState({}, "", window.location.pathname);
                loadCatalog();
            });
        }

        document.querySelectorAll(".product-card").forEach(card => {
            card.addEventListener("click", (e) => {
                if (e.target.classList.contains("quick-add-btn")) return;
                const productId = card.getAttribute("data-id");
                history.pushState({ productId }, "", `?id=${productId}`);
                loadProductDetail(productId);
            });
        });

        document.querySelectorAll(".quick-add-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.stopPropagation();
                const productId = btn.getAttribute("data-id");
                await addToCart(productId);
            });
        });
    }

    async function addToCart(productId) {
        const userJson = localStorage.getItem("hersmile_current_user");
        if (!userJson) {
            alert("Please sign in first!");
            const authModal = document.getElementById("authModal");
            if (authModal) authModal.classList.add("active");
            return;
        }

        let user;
        try {
            user = JSON.parse(userJson);
        } catch (err) {
            console.error("Error parsing user data", err);
            localStorage.removeItem("hersmile_current_user");
            alert("Please sign in first!");
            const authModal = document.getElementById("authModal");
            if (authModal) authModal.classList.add("active");
            return;
        }

        try {
            const res = await fetch('/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, productId: productId })
            });

            const data = await res.json();

            if (res.ok) {
                alert("Product added to cart successfully!");
            } else {
                alert("Server error: " + (data.error || data.message || "Unknown error"));
            }
        } catch (e) {
            console.error("Network or catch error:", e);
            alert("Network error: " + e.message);
        }
    }

    async function loadProductDetail(id) {
        try {
            const response = await fetch(`/api/products/${id}`);
            if (!response.ok) throw new Error("Product not found");
            const product = await response.json();

            if (carouselContainer) carouselContainer.style.display = "none";

            catalogContainer.innerHTML = `
                <div style="max-width: 1000px; margin: 40px auto; padding: 0 20px; font-family: sans-serif; width: 100%;">
                    <button id="backToCatalog" style="background: none; border: none; cursor: pointer; font-size: 14px; color: #555; margin-bottom: 20px;">← Back to products</button>
                    
                    <div style="display: flex; flex-wrap: wrap; gap: 40px; align-items: flex-start;">
                        <div style="flex: 1; min-width: 280px;">
                            <p style="font-size: 12px; color: #888; text-transform: uppercase; margin-bottom: 5px;">${product.brand} / ${product.category}</p>
                            <h1 style="font-size: 26px; font-weight: bold; color: #111; margin-bottom: 15px;">${product.name}</h1>
                            <div style="font-size: 24px; font-weight: bold; color: #d00; margin-bottom: 25px;">$${product.price}</div>
                            
                            <button id="addToCartDetail" style="width: 100%; background: #6A0809; color: #F4EFE0; padding: 14px; border: none; font-weight: bold; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; border-radius: 6px;">
                                Add to cart
                            </button>
                            
                            <p style="font-size: 13px; color: #28a745;">✓ In stock</p>
                        </div>

                        <div style="flex: 1.5; min-width: 300px; display: flex; justify-content: center; align-items: center; background: #fff; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                            <img src="${product.image}" alt="${product.name}" style="max-height: 380px; max-width: 100%; object-fit: contain;">
                        </div>
                    </div>

                    <div style="margin-top: 50px; border-top: 1px solid #eee; padding-top: 30px;">
                        <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #222;">Description & Characteristics</h3>
                        <div style="display: grid; grid-template-columns: 150px 1fr; gap: 12px; font-size: 14px; color: #333; max-width: 700px;">
                            <div style="color: #777;">Brand:</div>
                            <div>${product.brand}</div>

                            <div style="color: #777;">Category:</div>
                            <div>${product.category}</div>

                            <div style="color: #777;">Description:</div>
                            <div>${product.description}</div>
                        </div>
                    </div>
                </div>
            `;

            document.getElementById("backToCatalog").addEventListener("click", () => {
                history.pushState({}, "", window.location.pathname);
                loadCatalog();
            });

            document.getElementById("addToCartDetail").addEventListener("click", async () => {
                await addToCart(product.id);
            });

        } catch (err) {
            console.error(err);
        }
    }

    window.loadCatalogByCategory = loadCatalog;

    const urlParams = new URLSearchParams(window.location.search);
    const productIdParam = urlParams.get("id");

    if (productIdParam) {
        loadProductDetail(productIdParam);
    } else {
        loadCatalog();
    }
});