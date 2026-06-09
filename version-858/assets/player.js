(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function setupPlayer() {
    var player = document.querySelector("[data-player]");
    if (!player) {
      return;
    }
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play]");
    var streamUrl = player.getAttribute("data-stream");
    var loaded = false;
    var hlsInstance = null;

    function loadStream() {
      if (loaded || !video || !streamUrl) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        window.addEventListener("pagehide", function () {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
        }, { once: true });
        return;
      }
      video.src = streamUrl;
    }

    function playVideo() {
      loadStream();
      player.classList.add("is-playing");
      video.controls = true;
      var playback = video.play();
      if (playback && playback.catch) {
        playback.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", playVideo);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
    }
  }

  ready(setupPlayer);
})();
