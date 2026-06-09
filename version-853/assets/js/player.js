(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('[data-video]');
    var button = player.querySelector('[data-play-button]');

    if (!video || !button) {
      return;
    }

    var source = video.getAttribute('data-source');
    var hlsInstance = null;

    function attachSource() {
      if (video.getAttribute('data-ready') === 'true') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      video.setAttribute('data-ready', 'true');
    }

    function playVideo() {
      attachSource();
      player.classList.add('is-playing');
      video.controls = true;
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          player.classList.remove('is-playing');
          video.controls = true;
        });
      }
    }

    button.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
