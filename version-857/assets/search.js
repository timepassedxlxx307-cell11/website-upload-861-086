document.addEventListener('DOMContentLoaded', function () {
  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  var summary = document.getElementById('searchSummary');
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';

  if (!input || !results || !summary) {
    return;
  }

  input.value = initialQuery;

  function createCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).join(' ');
    return [
      '<article class="movie-card">',
      '  <a class="movie-poster" href="' + escapeHtml(movie.url) + '">',
      '    <img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="movie-badge">' + escapeHtml(movie.category) + '</span>',
      '    <span class="poster-overlay">立即观看</span>',
      '  </a>',
      '  <div class="movie-info">',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-meta">',
      '      <span>⭐ ' + escapeHtml(movie.rating) + '</span>',
      '      <span>👁 ' + Number(movie.views).toLocaleString() + '</span>',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '    </div>',
      '    <div class="movie-tags">' + escapeHtml(tags) + '</div>',
      '  </div>',
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

  function render() {
    var query = input.value.trim().toLowerCase();
    var data = window.MOVIE_SEARCH_DATA || [];
    var matches = data.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.year,
        movie.category,
        movie.genre,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' ').toLowerCase();
      return !query || haystack.indexOf(query) !== -1;
    }).slice(0, 120);

    summary.textContent = query
      ? '关键词“' + input.value.trim() + '”找到 ' + matches.length + ' 条结果，最多展示前 120 条。'
      : '未输入关键词，默认展示热度靠前的 120 条影片。';

    results.innerHTML = matches.map(createCard).join('\n');
  }

  input.addEventListener('input', render);
  render();
});
