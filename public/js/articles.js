document.addEventListener("DOMContentLoaded", () => {
    const articleModal = document.getElementById("articleModal");
    const closeArticleModal = document.getElementById("closeArticleModal");
    const articleModalContent = document.getElementById("articleModalContent");

    const ARTICLES = {
        article1: {
            image: "images/towar1.jpg",
            title: "Behind \"Her Smile\": How Our Journey Began",
            text: "At the core of Her Smile is a simple, powerful belief: makeup should never hide who you are; it should celebrate it. Our brand was born out of a profound desire to create something more than just cosmetics. We wanted to bottle up that feeling of looking in the mirror and genuinely smiling at the reflection staring back.\n" +
                "\n" +
                "When we first started developing our products, our motivation was clear. We didn't want to follow fleeting trends; we wanted to create timeless formulas that felt like a second skin. Countless hours were spent testing textures, refining pigments, and sourcing the finest ingredients. We rejected anything that didn't meet our absolute highest standards because we were creating these products for real people with real lives. Every lipstick, foundation, and palette we have brought to life is a testament to that journey. We designed them not just to enhance your natural beauty, but to inspire your daily confidence and bring out your truest, most radiant smile.",
            productIds: [1, 2, 3]
        },
        article2: {
            image: "images/towar2.jpg",
            title: "The Heart of Our Brand: Devoted to You and Our Craft",
            text: "A brand is only as strong as the people behind it, and at Her Smile, our team is our heartbeat. For our employees, these aren't just products on a shelf—they are true labors of love. Every member of our team, from the developers in the lab to our customer care specialists, deeply cherishes the magic we put into every single package. We hold our craft to the highest standard because we are passionate about the art of beauty.\n" +
                "\n" +
                "But more importantly, we cherish you, our clients. We understand that when you choose our brand, you are trusting us with your daily rituals and your personal expression. That is why our team’s ultimate goal is to offer you nothing but the absolute best. We celebrate your uniqueness, we listen closely to your feedback, and we constantly strive to exceed your expectations. When you wear Her Smile, you aren't just wearing makeup—you are wearing the dedication, warmth, and care of an entire team that genuinely wants you to feel beautiful, powerful, and unconditionally loved every single day.",
            productIds: [4, 5, 6]
        }
    };

    async function openArticle(key) {
        const article = ARTICLES[key];
        if (!article || !articleModal || !articleModalContent) return;

        articleModalContent.innerHTML = `
            <div class="article-hero-wrapper">
                <img src="${article.image}" alt="" class="article-hero-bg">
                <img src="${article.image}" alt="${article.title}" class="article-hero-img">
            </div>
            <h2 class="article-title">${article.title}</h2>
            <p class="article-text">${article.text}</p>
            <div class="article-products-title">Featured in this article</div>
            <div class="article-products-list" id="articleProductsList">Loading...</div>
        `;

        articleModal.classList.add("active");

        try {
            const products = await Promise.all(
                article.productIds.map(id => fetch(`/api/products/${id}`).then(r => r.json()))
            );

            const list = document.getElementById("articleProductsList");
            if (list) {
                list.innerHTML = products.map(p => `
                    <a href="?id=${p.id}" class="article-product-link" data-id="${p.id}">
                        <img src="${p.image}" alt="${p.name}">
                        <span class="article-product-name">${p.name}</span>
                    </a>
                `).join('');

                list.querySelectorAll(".article-product-link").forEach(link => {
                    link.addEventListener("click", (e) => {
                        e.preventDefault();
                        const productId = link.getAttribute("data-id");
                        articleModal.classList.remove("active");
                        history.pushState({ productId }, "", `?id=${productId}`);
                        if (window.loadProductDetailById) {
                            window.loadProductDetailById(productId);
                            document.getElementById("catalogContainer")
                                ?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                    });
                });
            }
        } catch (err) {
            console.error("Failed to load article products:", err);
        }
    }

    const card1 = document.getElementById("featureCard1");
    const card2 = document.getElementById("featureCard2");

    if (card1) card1.addEventListener("click", () => openArticle("article1"));
    if (card2) card2.addEventListener("click", () => openArticle("article2"));

    if (closeArticleModal) {
        closeArticleModal.addEventListener("click", () => {
            articleModal.classList.remove("active");
        });
    }

    if (articleModal) {
        articleModal.addEventListener("click", (e) => {
            if (e.target === articleModal) {
                articleModal.classList.remove("active");
            }
        });
    }
});