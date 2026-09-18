document.addEventListener("DOMContentLoaded", () => {
    const footerModal = document.getElementById("footerModal");
    const closeFooterModal = document.getElementById("closeFooterModal");
    const footerModalContent = document.getElementById("footerModalContent");
    const footerRandomNumber = document.getElementById("footerRandomNumber");
    const FOOTER_PAGES = {
        privacy: {
            title: "Privacy Policy",
            html: `
                <p>We respect your privacy. This page describes what personal data
                we collect (such as your email and order details), how we use it to
                process orders and improve our service, and how you can request that
                your data be updated or deleted.</p>
                <p>We never sell your personal information to third parties.</p>
                <p>Please note that this website was built with the assistance of AI technologies to ensure the best possible experience for you.</p>
            `
        },
        delivery: {
            title: "About Delivery",
            html: `
                <p>We ship worldwide. Standard delivery usually takes 3–7 business
                days depending on your location. Express shipping options are
                available at checkout.</p>
                <p>You will receive a tracking number by email as soon as your order
                is shipped.</p>
            `
        },
        products: {
            title: "About Products",
            html: `
                <p>Every product in our catalog is carefully selected and tested to
                meet our quality standards. We work with trusted formulas and
                ingredients to bring you cosmetics that feel as good as they look.</p>
            `
        },
        perfumes: {
            title: "Perfumes",
            html: `
                <p>Discover our perfume collection — from light everyday scents to
                bold evening fragrances, crafted to match every mood.</p>
            `,
            category: "perfume"
        },
        makeup: {
            title: "Makeup",
            html: `
                <p>Our makeup line covers everything from natural everyday looks to
                full glam, designed to celebrate your unique beauty.</p>
            `,
            category: "makeup"
        },
        contacts: {
            title: "Contacts",
            html: `
                <p>Email: support@hersmile.com</p>
                <p>Phone: +380 00 000 00 00</p>
                <p>We usually reply within 24 hours.</p>
            `
        }
    };

    function openFooterPage(key) {
        const page = FOOTER_PAGES[key];
        if (!page || !footerModal || !footerModalContent) return;

        let ctaHtml = "";
        if (page.category) {
            ctaHtml = `<button class="footer-modal-cta" id="footerCtaBtn">View collection</button>`;
        }

        footerModalContent.innerHTML = `
            <h2 class="footer-modal-title">${page.title}</h2>
            <div class="footer-modal-text">${page.html}</div>
            ${ctaHtml}
        `;

        footerModal.classList.add("active");

        const ctaBtn = document.getElementById("footerCtaBtn");
        if (ctaBtn && page.category) {
            ctaBtn.addEventListener("click", () => {
                footerModal.classList.remove("active");
                if (window.loadCatalogByCategory) {
                    window.loadCatalogByCategory(page.category);
                    document.getElementById("catalogContainer")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        }
    }

    document.querySelectorAll("[data-footer-page]").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            openFooterPage(link.getAttribute("data-footer-page"));
        });
    });

    if (closeFooterModal) {
        closeFooterModal.addEventListener("click", () => {
            footerModal.classList.remove("active");
        });
    }

    if (footerModal) {
        footerModal.addEventListener("click", (e) => {
            if (e.target === footerModal) {
                footerModal.classList.remove("active");
            }
        });

    }
});