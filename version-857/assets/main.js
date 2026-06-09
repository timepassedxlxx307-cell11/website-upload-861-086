document.addEventListener('DOMContentLoaded', function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-main-nav]');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a').forEach(function (link) {
    var href = link.getAttribute('href') || '';
    if (href.endsWith(current)) {
      link.classList.add('active');
    }
  });

  initHeroCarousel();
  initCardFilters();
});

function initHeroCarousel() {
  var carousel = document.querySelector('[data-hero-carousel]');
  if (!carousel) {
    return;
  }

  var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
  var prev = carousel.querySelector('[data-hero-prev]');
  var next = carousel.querySelector('[data-hero-next]');
  var index = 0;
  var timer = null;

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === index);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
    }
  }

  if (prev) {
    prev.addEventListener('click', function () {
      show(index - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      show(index + 1);
      start();
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      show(dotIndex);
      start();
    });
  });

  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  start();
}

function initCardFilters() {
  var scopes = document.querySelectorAll('[data-filter-scope]');

  scopes.forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var category = scope.querySelector('[data-category-filter]');
    var year = scope.querySelector('[data-year-filter]');
    var container = document.querySelector('[data-card-container]');

    if (!container) {
      return;
    }

    var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card'));

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var selectedCategory = category ? category.value : '';
      var selectedYear = year ? year.value : '';

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.year,
          card.dataset.category,
          card.dataset.tags,
          card.dataset.genre
        ].join(' ').toLowerCase();

        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesCategory = !selectedCategory || card.dataset.category === selectedCategory;
        var matchesYear = !selectedYear || card.dataset.year === selectedYear;
        card.style.display = matchesKeyword && matchesCategory && matchesYear ? '' : 'none';
      });
    }

    [input, category, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  });
}
