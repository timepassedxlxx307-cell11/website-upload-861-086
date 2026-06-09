(function () {
  var navShell = document.querySelector(".nav-shell");
  var navToggle = document.querySelector(".nav-toggle");

  if (navShell && navToggle) {
    navToggle.addEventListener("click", function () {
      var open = navShell.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var slider = document.querySelector("[data-hero-slider]");

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }

    function restartTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      startTimer();
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        restartTimer();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        restartTimer();
      });
    }

    startTimer();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function filterCards() {
    var input = document.querySelector(".local-filter");
    var select = document.querySelector(".filter-select");
    var grid = document.querySelector("[data-filter-grid]");

    if (!grid || !input) {
      return;
    }

    var text = normalize(input.value);
    var type = select ? normalize(select.value) : "";
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre")
      ].join(" "));
      var typeMatch = !type || normalize(card.getAttribute("data-type")).indexOf(type) !== -1;
      var textMatch = !text || haystack.indexOf(text) !== -1;
      card.classList.toggle("is-hidden", !(typeMatch && textMatch));
    });
  }

  var localFilter = document.querySelector(".local-filter");
  var filterSelect = document.querySelector(".filter-select");

  if (localFilter) {
    localFilter.addEventListener("input", filterCards);
  }

  if (filterSelect) {
    filterSelect.addEventListener("change", filterCards);
  }

  function cardTemplate(movie) {
    return [
      '<a class="movie-card" href="' + movie.url + '" data-title="' + escapeAttr(movie.title) + '">',
      '<figure class="poster-wrap">',
      '<img src="' + movie.image + '" alt="' + escapeAttr(movie.title) + '在线观看封面" loading="lazy">',
      '<span class="poster-type">' + escapeHtml(movie.type) + '</span>',
      '<span class="poster-year">' + escapeHtml(movie.year) + '</span>',
      '</figure>',
      '<div class="card-body">',
      '<h3>' + escapeHtml(movie.title) + '</h3>',
      '<p class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</p>',
      '<p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
      '</div>',
      '</a>'
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

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }

  function renderSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");

    if (!results || !window.SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get("q"));
    var list = window.SEARCH_INDEX;
    var matched = query ? list.filter(function (movie) {
      return normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.oneLine
      ].join(" ")).indexOf(query) !== -1;
    }) : list.slice(0, 48);

    if (title) {
      title.textContent = query ? "搜索结果" : "热门影片搜索";
    }

    results.innerHTML = matched.slice(0, 120).map(cardTemplate).join("");
  }

  renderSearchPage();

  window.initMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    var loaded = false;
    var hls = null;

    if (!video || !button || !options.src) {
      return;
    }

    function playVideo() {
      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    function attachAndPlay() {
      button.classList.add("is-hidden");
      video.setAttribute("controls", "controls");

      if (loaded) {
        playVideo();
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = options.src;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(options.src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hls) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            }
          }
        });
        return;
      }

      video.src = options.src;
      video.addEventListener("loadedmetadata", playVideo, { once: true });
      playVideo();
    }

    button.addEventListener("click", attachAndPlay);
    video.addEventListener("click", function () {
      if (video.paused) {
        attachAndPlay();
      }
    });
  };
})();
