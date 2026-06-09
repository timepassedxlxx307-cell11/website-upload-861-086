(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initSearchForms() {
        var forms = document.querySelectorAll("[data-site-search]");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    return;
                }
                event.preventDefault();
                window.location.href = "./search.html?q=" + encodeURIComponent(input.value.trim());
            });
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot") || 0));
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }
        show(0);
        restart();
    }

    function initCardFilter() {
        var input = document.querySelector("[data-card-search]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-tag-filter]"));
        var empty = document.querySelector("[data-empty-state]");
        if (!cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var activeTag = "";
        if (input && params.get("q")) {
            input.value = params.get("q");
        }

        function applyFilter() {
            var keyword = normalize(input ? input.value : "");
            var tag = normalize(activeTag);
            var visible = 0;
            cards.forEach(function (card) {
                var searchText = normalize(card.getAttribute("data-search"));
                var matchedKeyword = !keyword || searchText.indexOf(keyword) !== -1;
                var matchedTag = !tag || searchText.indexOf(tag) !== -1;
                var matched = matchedKeyword && matchedTag;
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeTag = button.getAttribute("data-tag-filter") || "";
                buttons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                applyFilter();
            });
        });
        applyFilter();
    }

    function bindPlayer(videoUrl) {
        ready(function () {
            var video = document.getElementById("movie-player");
            var overlay = document.getElementById("player-overlay");
            if (!video || !overlay || !videoUrl) {
                return;
            }
            var prepared = false;
            var hls = null;

            function prepare() {
                if (prepared) {
                    return;
                }
                prepared = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = videoUrl;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(videoUrl);
                    hls.attachMedia(video);
                    return;
                }
                video.src = videoUrl;
            }

            function start() {
                prepare();
                overlay.classList.add("is-hidden");
                video.setAttribute("controls", "controls");
                var playResult = video.play();
                if (playResult && typeof playResult.catch === "function") {
                    playResult.catch(function () {});
                }
            }

            overlay.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    window.MovieSite = {
        bindPlayer: bindPlayer
    };

    ready(function () {
        initMenu();
        initSearchForms();
        initHero();
        initCardFilter();
    });
})();
