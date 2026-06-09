(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMenu() {
        var toggle = qs('[data-menu-toggle]');
        var nav = qs('[data-main-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHeaderSearch() {
        qsa('[data-header-search]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = qs('input[name="q"]', form);
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = 'search.html';
                }
            });
        });
    }

    function initHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function next() {
            show(current + 1);
        }

        function start() {
            stop();
            timer = window.setInterval(next, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        var prevButton = qs('[data-hero-prev]', hero);
        var nextButton = qs('[data-hero-next]', hero);
        if (prevButton) {
            prevButton.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (nextButton) {
            nextButton.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initCardFilters() {
        qsa('[data-card-filter]').forEach(function (input) {
            var section = input.closest('section') || document;
            var cards = qsa('.movie-card', section);
            input.addEventListener('input', function () {
                var keyword = normalize(input.value);
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-genre'),
                        card.textContent
                    ].join(' '));
                    card.style.display = !keyword || haystack.indexOf(keyword) !== -1 ? '' : 'none';
                });
            });
        });
    }

    function initSearchPage() {
        var form = qs('[data-search-form]');
        var input = qs('[data-search-input]');
        var results = qs('[data-search-results]');
        var meta = qs('[data-search-meta]');
        var data = window.MOVIE_SEARCH_DATA || [];
        if (!form || !input || !results || !meta) {
            return;
        }

        function card(movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');
            return [
                '<article class="movie-card">',
                '    <a class="poster" href="' + movie.url + '">',
                '        <img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '        <span class="play-chip">播放</span>',
                '    </a>',
                '    <div class="movie-card-body">',
                '        <div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
                '        <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
                '        <p>' + escapeHtml(movie.oneLine) + '</p>',
                '        <div class="tag-row">' + tags + '</div>',
                '    </div>',
                '</article>'
            ].join('\n');
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function runSearch() {
            var keyword = normalize(input.value);
            var matched = data.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    (movie.tags || []).join(' '),
                    movie.oneLine
                ].join(' '));
                return !keyword || haystack.indexOf(keyword) !== -1;
            }).slice(0, 120);
            meta.textContent = keyword ? '找到 ' + matched.length + ' 条相关结果' : '展示最新 120 条影片';
            results.innerHTML = matched.map(card).join('\n');
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            runSearch();
        });
        input.addEventListener('input', runSearch);
        var query = new URLSearchParams(window.location.search).get('q') || '';
        input.value = query;
        runSearch();
    }

    function initPlayers() {
        qsa('[data-player-shell]').forEach(function (shell) {
            var video = qs('video[data-video-src]', shell);
            var button = qs('[data-play-button]', shell);
            var hlsInstance = null;
            if (!video) {
                return;
            }

            function attachSource() {
                var src = video.getAttribute('data-video-src');
                if (!src || video.getAttribute('data-bound') === 'true') {
                    return;
                }
                video.setAttribute('data-bound', 'true');
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = src;
                }
            }

            function play() {
                attachSource();
                if (button) {
                    button.classList.add('is-hidden');
                }
                var request = video.play();
                if (request && typeof request.catch === 'function') {
                    request.catch(function () {
                        if (button) {
                            button.classList.remove('is-hidden');
                        }
                    });
                }
            }

            if (button) {
                button.addEventListener('click', play);
            }
            shell.addEventListener('click', function (event) {
                if (event.target === video && video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (button && !video.currentTime) {
                    button.classList.remove('is-hidden');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHeaderSearch();
        initHero();
        initCardFilters();
        initSearchPage();
        initPlayers();
    });
}());
