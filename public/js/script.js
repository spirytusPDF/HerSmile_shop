let slideIndex = 1;

const CATEGORY_MAP = {
    perfumes: "perfume",
    makeup: "makeup"
};

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const menuPanel = document.getElementById('menuPanel');
    const menuPanelOverlay = document.getElementById('menuPanelOverlay');
    const closeMenuPanel = document.getElementById('closeMenuPanel');

    function openMenuPanel() {
        if (menuPanel) menuPanel.classList.add('show');
        if (menuPanelOverlay) menuPanelOverlay.classList.add('show');
    }

    function closeMenuPanelFunc() {
        if (menuPanel) menuPanel.classList.remove('show');
        if (menuPanelOverlay) menuPanelOverlay.classList.remove('show');
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            openMenuPanel();
        });
    }

    if (closeMenuPanel) {
        closeMenuPanel.addEventListener('click', closeMenuPanelFunc);
    }

    if (menuPanelOverlay) {
        menuPanelOverlay.addEventListener('click', closeMenuPanelFunc);
    }

    if (menuPanel) {
        menuPanel.querySelectorAll('.menu-panel-option').forEach(option => {
            option.addEventListener('click', () => {
                const category = option.getAttribute('data-category');
                const hash = category === 'makeup' ? 'makeup' : 'perfumes';

                closeMenuPanelFunc();
                history.pushState({ category }, '', `#${hash}`);

                if (window.loadCatalogByCategory) {
                    window.loadCatalogByCategory(category);
                    document.getElementById('catalogContainer')
                        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    document.querySelectorAll('.slide-card[href^="#"]').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const hash = card.getAttribute('href').substring(1);
            const category = CATEGORY_MAP[hash];

            history.pushState({ category: hash }, '', `#${hash}`);
            if (window.loadCatalogByCategory) {
                window.loadCatalogByCategory(category);
                document.getElementById('catalogContainer')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    showSlides(slideIndex);

    const prevBtn = document.getElementById('prevSlide');
    const nextBtn = document.getElementById('nextSlide');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => showSlides(slideIndex -= 1));
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => showSlides(slideIndex += 1));
    }
});

function showSlides(n) {
    const slides = document.getElementsByClassName('carousel-slide');
    if (!slides || slides.length === 0) return;

    if (n > slides.length) slideIndex = 1;
    if (n < 1) slideIndex = slides.length;

    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = 'none';
    }
    slides[slideIndex - 1].style.display = 'block';
}