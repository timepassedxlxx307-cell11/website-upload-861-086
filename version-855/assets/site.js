function ready(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
}

ready(function () {
    var navToggle = document.querySelector(".nav-toggle");
    var navLinks = document.querySelector(".nav-links");

    if (navToggle && navLinks) {
        navToggle.addEventListener("click", function () {
            navLinks.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === activeIndex);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === activeIndex);
        });
    }

    function startSlider() {
        if (timer || slides.length <= 1) {
            return;
        }

        timer = window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
            window.clearInterval(timer);
            timer = null;
            startSlider();
        });
    });

    showSlide(0);
    startSlider();

    var searchInput = document.querySelector("[data-movie-search]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var categoryFilter = document.querySelector("[data-category-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));
    var emptyState = document.querySelector(".empty-state");

    if (searchInput && window.location.search) {
        var params = new URLSearchParams(window.location.search);
        var keywordFromUrl = params.get("q");

        if (keywordFromUrl && !searchInput.value) {
            searchInput.value = keywordFromUrl;
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
        var keyword = normalize(searchInput ? searchInput.value : "");
        var typeValue = normalize(typeFilter ? typeFilter.value : "");
        var categoryValue = normalize(categoryFilter ? categoryFilter.value : "");
        var visibleCount = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-search"));
            var type = normalize(card.getAttribute("data-type"));
            var category = normalize(card.getAttribute("data-category"));
            var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchedType = !typeValue || type === typeValue;
            var matchedCategory = !categoryValue || category === categoryValue;
            var matched = matchedKeyword && matchedType && matchedCategory;

            card.style.display = matched ? "" : "none";

            if (matched) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.style.display = visibleCount ? "none" : "block";
        }
    }

    [searchInput, typeFilter, categoryFilter].forEach(function (element) {
        if (element) {
            element.addEventListener("input", applyFilters);
            element.addEventListener("change", applyFilters);
        }
    });

    applyFilters();
});
