(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var next = hero.querySelector('[data-hero-next]');
    var prev = hero.querySelector('[data-hero-prev]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  var searchInput = document.querySelector('.js-search-input');
  var searchList = document.querySelector('[data-search-list]');
  var searchCount = document.querySelector('[data-search-count]');

  if (searchInput && searchList) {
    var cards = Array.prototype.slice.call(searchList.querySelectorAll('[data-search]'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function update() {
      var keyword = normalize(searchInput.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var matched = !keyword || haystack.indexOf(keyword) !== -1;
        card.classList.toggle('hidden-by-search', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (searchCount) {
        searchCount.textContent = keyword ? String(visible) : '';
      }
    }

    searchInput.addEventListener('input', update);
    update();
  }
})();
