(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.textContent = open ? "×" : "☰";
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    show(0);
    restart();
  }

  function initFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll("[data-card-list]"));
    lists.forEach(function (list) {
      var section = list.closest("section") || document;
      var input = section.querySelector("[data-search-input]");
      var select = section.querySelector("[data-category-filter]");
      var empty = section.querySelector("[data-empty-state]");
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .rank-card"));
      if (!input && !select) {
        return;
      }
      function apply() {
        var query = normalize(input ? input.value : "");
        var category = select ? select.value : "全部";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-title") || card.textContent);
          var cardCategory = card.getAttribute("data-category") || "";
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchCategory = category === "全部" || cardCategory === category;
          var show = matchQuery && matchCategory;
          card.style.display = show ? "" : "none";
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }
      if (input) {
        input.addEventListener("input", apply);
      }
      if (select) {
        select.addEventListener("change", apply);
      }
    });
  }

  function initImages() {
    Array.prototype.slice.call(document.images).forEach(function (img) {
      img.addEventListener("error", function () {
        img.style.visibility = "hidden";
      }, { once: true });
    });
  }

  window.initMoviePlayer = function (videoId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !streamUrl) {
      return;
    }
    var canNative = video.canPlayType("application/vnd.apple.mpegurl");
    if (canNative) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    function begin() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var playTask = video.play();
      if (playTask && playTask.catch) {
        playTask.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", begin);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initImages();
  });
})();
