document.addEventListener("DOMContentLoaded", () => {
    const catalogContainer = document.getElementById("catalogContainer");
    const carouselContainer = document.querySelector(".carousel-container");
    const featureArticles = document.querySelector(".feature-articles");
    const siteFooter = document.querySelector(".site-footer");

    function showFooter() {
        if (siteFooter) siteFooter.style.display = "";
    }

    function hideFooter() {
        if (siteFooter) siteFooter.style.display = "none";
    }

    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");

    function matchesQuery(product, q) {
        const haystack = [
            product.name,
            product.brand,
            product.category,
            product.description
        ].filter(Boolean).join(" ").toLowerCase();

        // все слова из запроса должны найтись
        return q.split(/\s+/).every(word => haystack.includes(word));
    }

    async function loadSearch(query) {
        if (!catalogContainer) return;

        const raw = (query || "").trim();
        if (!raw) {
            loadCatalog();
            return;
        }

        const q = raw.toLowerCase();

        if (carouselContainer) carouselContainer.style.display = "none";
        if (featureArticles) featureArticles.style.display = "none";
        showFooter();

        try {
            // на бэкенде нет отдельного /search, поэтому берём весь каталог
            // существующим роутом и фильтруем на клиенте
            const response = await fetch('/api/products');
            const products = await response.json();
            const found = products.filter(product => matchesQuery(product, q));

            renderCatalog(found, null, `Search results for "${raw}"`);
        } catch (err) {
            console.error("Failed to search products:", err);
        }
    }

    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            loadSearch(searchInput ? searchInput.value : "");
            catalogContainer?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    if (searchInput) {
        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                loadSearch(searchInput.value);
                catalogContainer?.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    }

    async function loadCatalog(category) {
        if (!catalogContainer) return;

        if (carouselContainer) carouselContainer.style.display = category ? "none" : "block";
        if (featureArticles) featureArticles.style.display = category ? "none" : "flex";

        showFooter();

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

    function renderCatalog(products, category, titleOverride) {
        const titleMap = { perfume: "Perfumes", makeup: "Makeup" };
        const title = titleOverride
            ? titleOverride
            : (category ? (titleMap[category] || category) : "Our Products");
        const showClearBtn = Boolean(category || titleOverride);

        let gridHtml = products.map((product, index) => `
            <div class="product-card fade-in-card" data-id="${product.id}" style="animation-delay: ${Math.min(index, 12) * 60}ms; cursor: pointer; background: #b3bf85; padding: 15px; border-radius: 4px; border: 1px solid #ffe0cb;">
<div class="product-img-wrapper" style="position: relative; height: 220px; display: flex; align-items: center; justify-content: center; background: #f1e5c5; margin-bottom: 12px;border-radius: 4px; overflow: hidden;">
    <img class="product-img" src="${product.image}" alt="${product.name}" style="width: 100%;height: 100%;object-fit: cover;">
</div>
                <div style="font-size: 15px; color: #fff2b2; text-transform: uppercase; margin-bottom: 4px;">${product.brand}</div>
                <div style="background: #f1e5c5; padding: 2px;border-radius: 4px; "><h3 style="font-size: 17px; font-weight: 600; margin-bottom: 8px;margin-left:3px; color: #1e1616; line-height: 1.3;">${product.name}</h3>
                <div style="font-size: 16px; font-weight: bold; color: #d00; margin-bottom: 12px;margin-left:4px;">$${product.price}</div></div>
                
                <button class="quick-add-btn" data-id="${product.id}">
                    Add to cart
                </button>
            </div>
        `).join('');

        if (products.length === 0) {
            const emptyText = titleOverride
                ? "Nothing found. Try a different word."
                : "No products found in this category.";
            gridHtml = `<p style="grid-column: 1/-1; text-align:center; color:#777;">${emptyText}</p>`;
        }

        catalogContainer.style.display = "block";
        catalogContainer.style.width = "100%";

        catalogContainer.innerHTML = `
            <div style="max-width: 1200px; margin: 50px auto 0 auto; padding: 0 20px; width: 100%;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 30px;">
                    <h2 style="font-family: 'Playfair Display', serif; font-size: 32px; color: #111; margin: 0;">${title}</h2>
                    ${showClearBtn ? `<button id="clearFilterBtn" class="clear-filter-btn">Show all</button>` : ''}
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 25px;">
                    ${gridHtml}
                </div>
            </div>
        `;

        if (showClearBtn) {
            document.getElementById("clearFilterBtn").addEventListener("click", () => {
                history.pushState({}, "", window.location.pathname);
                if (searchInput) searchInput.value = "";
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

    async function loadProductDetail(id, fromArticle) {
        try {
            const response = await fetch(`/api/products/${id}`);
            if (!response.ok) throw new Error("Product not found");
            const product = await response.json();

            if (carouselContainer) carouselContainer.style.display = "none";
            if (featureArticles) featureArticles.style.display = fromArticle ? "flex" : "none";

            hideFooter();

            catalogContainer.innerHTML = `
                <div style="max-width: 1000px; margin: 40px auto; padding: 0 20px; font-family: sans-serif; width: 100%;">
                    <button id="backToCatalog" class="back-to-catalog-btn">← Back to products</button>
                    
                    <div style="display: flex; flex-wrap: wrap; gap: 40px; align-items: flex-start;">
                        <div style="flex: 1; min-width: 280px;">
                            <p style="font-family: 'Galathea Two', 'Cormorant Garamond', 'Playfair Display', Georgia, serif;font-size: 12px;font-weight: bold; color: #888; text-transform: uppercase; margin-bottom: 5px;">${product.brand} / ${product.category}</p>
                            <h1 style="font-family: 'Galathea Two', 'Cormorant Garamond', 'Playfair Display', Georgia, serif;font-size: 26px; font-weight: bold; color: #111; margin-bottom: 15px;">${product.name}</h1>
                            <div style="font-size: 24px; font-weight: bold; color: #1e1616; margin-bottom: 25px;">$${product.price}</div>
                            
                            <button id="addToCartDetail" class="add-to-cart-detail-btn">
                                Add to cart
                            </button>
                            
                            <p style="font-size: 13px; color: #28a745;">✓ In stock</p>
                        </div>

                        <div style="flex: 1.5; min-width: 300px; display: flex; justify-content: center; align-items: center; background: #fff4e0; padding: 20px; border: 1px solid #470a0b; border-radius: 8px;">
                            <img src="${product.image}" alt="${product.name}" style="max-height: 380px; max-width: 100%; object-fit: contain;">
                        </div>
                    </div>

                    <div style="margin-top: 50px; border-top: 1px solid #eee; padding-top: 30px;">
                        <h3 style="font-family: 'Galathea Two', 'Cormorant Garamond', 'Playfair Display', Georgia, serif;font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #222;">Description & Characteristics</h3>
                        <div style="display: grid; grid-template-columns: 150px 1fr; gap: 12px; font-size: 14px; color: #333; max-width: 700px;">
                            <div style="color: #777;">Brand:</div>
                            <div style="font-family: 'Galathea Two', 'Cormorant Garamond', 'Playfair Display', Georgia, serif;font-size: 18px;">${product.brand}</div>

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
    window.loadSearchResults = loadSearch;
    window.loadProductDetailById = (id) => loadProductDetail(id, true);

    const urlParams = new URLSearchParams(window.location.search);
    const productIdParam = urlParams.get("id");

    if (productIdParam) {
        loadProductDetail(productIdParam);
    } else {
        loadCatalog();
    }
});