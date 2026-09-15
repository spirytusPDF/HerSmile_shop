let slideIndex = 1;

const CATEGORY_MAP = {
    perfumes: "perfume",
    makeup: "makeup"
};

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (menuToggle && dropdownMenu) {
        menuToggle.addEventListener('click', () => {
            dropdownMenu.classList.toggle('show');
        });

        window.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });

        dropdownMenu.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const hash = link.getAttribute('href').substring(1);
                const category = CATEGORY_MAP[hash];

                dropdownMenu.classList.remove('show');
                history.pushState({ category: hash }, '', `#${hash}`);

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