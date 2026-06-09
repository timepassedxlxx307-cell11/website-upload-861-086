(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function setupCardFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]"));
    panels.forEach(function (panel) {
      var keywordInput = panel.querySelector("[data-filter-keyword]");
      var yearSelect = panel.querySelector("[data-filter-year]");
      var scope = panel.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card[data-title]"));
      var empty = scope.querySelector("[data-empty-result]");
      function applyFilter() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var year = normalize(yearSelect && yearSelect.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre
          ].join(" "));
          var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var okYear = !year || normalize(card.dataset.year) === year;
          var show = okKeyword && okYear;
          card.classList.toggle("cards-hidden", !show);
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }
      if (keywordInput) {
        keywordInput.addEventListener("input", applyFilter);
      }
      if (yearSelect) {
        yearSelect.addEventListener("change", applyFilter);
      }
    });
  }

  function movieCard(movie) {
    return [
      '<article class="movie-card">',
      '<a class="card-cover" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
      '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="card-badge">' + escapeHtml(movie.type) + '</span>',
      '</a>',
      '<div class="card-body">',
      '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="card-meta">',
      '<span>' + escapeHtml(movie.region) + '</span>',
      '<span>' + escapeHtml(movie.year) + '</span>',
      '<span>★ ' + escapeHtml(movie.rating) + '</span>',
      '</div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setupSearchPage() {
    var root = document.querySelector("[data-search-page]");
    if (!root || !window.searchMovies) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var queryInput = root.querySelector("[data-search-input]");
    var typeSelect = root.querySelector("[data-search-type]");
    var yearSelect = root.querySelector("[data-search-year]");
    var resultBox = root.querySelector("[data-search-results]");
    var emptyBox = root.querySelector("[data-search-empty]");
    if (queryInput && params.get("q")) {
      queryInput.value = params.get("q");
    }
    function render() {
      var query = normalize(queryInput && queryInput.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var results = window.searchMovies.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.oneLine,
          movie.region,
          movie.type,
          movie.genre,
          movie.tags
        ].join(" "));
        var okQuery = !query || haystack.indexOf(query) !== -1;
        var okType = !type || normalize(movie.type).indexOf(type) !== -1;
        var okYear = !year || normalize(movie.year) === year;
        return okQuery && okType && okYear;
      }).slice(0, 120);
      resultBox.innerHTML = results.map(movieCard).join("");
      emptyBox.classList.toggle("show", results.length === 0);
    }
    [queryInput, typeSelect, yearSelect].forEach(function (field) {
      if (field) {
        field.addEventListener("input", render);
        field.addEventListener("change", render);
      }
    });
    render();
  }

  ready(function () {
    setupMenu();
    setupHeroSlider();
    setupCardFilters();
    setupSearchPage();
  });
})();
