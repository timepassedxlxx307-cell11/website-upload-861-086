document.addEventListener("DOMContentLoaded", function () {
  initializeMobileNavigation();
  initializeHeroCarousel();
  initializeFilters();
  initializePlayer();
  initializeHeroSearch();
});

function initializeMobileNavigation() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (!toggle || !mobileNav) {
    return;
  }

  toggle.addEventListener("click", function () {
    mobileNav.classList.toggle("open");
  });
}

function initializeHeroCarousel() {
  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));

  if (slides.length === 0) {
    return;
  }

  let currentIndex = 0;
  let timer = null;

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === currentIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === currentIndex);
    });
  }

  function startAutoPlay() {
    stopAutoPlay();
    timer = window.setInterval(function () {
      showSlide(currentIndex + 1);
    }, 5200);
  }

  function stopAutoPlay() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
      startAutoPlay();
    });
  });

  const carousel = document.querySelector("[data-hero-carousel]");
  if (carousel) {
    carousel.addEventListener("mouseenter", stopAutoPlay);
    carousel.addEventListener("mouseleave", startAutoPlay);
  }

  showSlide(0);
  startAutoPlay();
}

function initializeFilters() {
  const panels = Array.from(document.querySelectorAll("[data-filter-panel]"));

  panels.forEach(function (panel) {
    const scope = panel.closest("main") || document;
    const cards = Array.from(scope.querySelectorAll("[data-movie-card]"));
    const input = panel.querySelector("[data-search-input]");
    const typeSelect = panel.querySelector("[data-filter-type]");
    const regionSelect = panel.querySelector("[data-filter-region]");
    const genreSelect = panel.querySelector("[data-filter-genre]");
    const result = panel.querySelector("[data-filter-result]");

    function normalize(value) {
      return String(value || "")
        .trim()
        .toLowerCase();
    }

    function applyFilters() {
      const query = normalize(input ? input.value : "");
      const selectedType = typeSelect ? typeSelect.value : "全部";
      const selectedRegion = regionSelect ? regionSelect.value : "全部";
      const selectedGenre = genreSelect ? genreSelect.value : "全部";
      let visibleCount = 0;

      cards.forEach(function (card) {
        const title = normalize(card.dataset.title);
        const region = card.dataset.region || "";
        const type = card.dataset.type || "";
        const genre = card.dataset.genre || "";
        const year = card.dataset.year || "";
        const searchable = normalize(
          [title, region, type, genre, year].join(" "),
        );
        const matchesQuery = !query || searchable.includes(query);
        const matchesType = selectedType === "全部" || type === selectedType;
        const matchesRegion =
          selectedRegion === "全部" || region === selectedRegion;
        const matchesGenre =
          selectedGenre === "全部" || genre.includes(selectedGenre);
        const isVisible =
          matchesQuery && matchesType && matchesRegion && matchesGenre;

        card.classList.toggle("hidden-by-filter", !isVisible);
        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (result) {
        result.textContent = "当前显示 " + visibleCount + " 部影片";
      }
    }

    [input, typeSelect, regionSelect, genreSelect].forEach(function (element) {
      if (element) {
        element.addEventListener("input", applyFilters);
        element.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  });
}

function initializePlayer() {
  const players = Array.from(document.querySelectorAll("[data-player]"));

  players.forEach(function (player) {
    const video = player.querySelector("video");
    const button = player.querySelector("[data-player-button]");
    const overlay = player.querySelector("[data-player-overlay]");
    const status = player.querySelector("[data-player-status]");

    if (!video || !button) {
      return;
    }

    const source = video.dataset.src;
    let hasStarted = false;
    let hlsInstance = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function playVideo() {
      const promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          setStatus("浏览器阻止了自动播放，请再次点击播放器播放。");
        });
      }
    }

    function startPlayer() {
      if (!source) {
        setStatus("当前影片暂无可用播放源。");
        return;
      }

      if (overlay) {
        overlay.classList.add("hidden");
      }

      setStatus("正在初始化高清播放源…");

      if (hasStarted) {
        playVideo();
        return;
      }

      hasStarted = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        setStatus("已启用浏览器原生 HLS 播放。");
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus("播放源加载完成，开始播放。");
          playVideo();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setStatus("播放源加载失败，请检查网络或播放地址。");
          }
        });
        return;
      }

      video.src = source;
      setStatus("当前浏览器未检测到 HLS 组件，已尝试直接打开播放源。");
      playVideo();
    }

    button.addEventListener("click", startPlayer);
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("hidden");
      }
    });
    video.addEventListener("pause", function () {
      setStatus("播放已暂停，可点击视频继续。");
    });
    video.addEventListener("ended", function () {
      setStatus("播放结束。");
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
}

function initializeHeroSearch() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q");
  const listSearch = document.querySelector("[data-search-input]");

  if (query && listSearch) {
    listSearch.value = query;
    listSearch.dispatchEvent(new Event("input"));
  }

  const form = document.querySelector("[data-hero-search]");

  if (!form) {
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const input = form.querySelector("input");
    const keyword = input ? input.value.trim() : "";
    const target = keyword
      ? "movies.html?q=" + encodeURIComponent(keyword)
      : "movies.html";
    window.location.href = target;
  });
}
