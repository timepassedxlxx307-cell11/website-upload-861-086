import { H as Hls } from './hls-vendor-dru42stk.js';

function setupPlayer() {
  var video = document.querySelector('.site-video');
  var button = document.querySelector('[data-play-video]');
  var status = document.querySelector('[data-video-status]');

  if (!video || !button) {
    return;
  }

  var source = video.dataset.videoSrc;
  var initialized = false;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function initialize() {
    if (initialized) {
      video.play().catch(function () {
        setStatus('请再次点击播放器开始播放');
      });
      return;
    }

    initialized = true;
    button.classList.add('hidden');
    setStatus('正在加载高清播放源...');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {
          setStatus('播放源已就绪，请点击视频控件播放');
        });
      }, { once: true });
      return;
    }

    if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus('播放源已就绪');
        video.play().catch(function () {
          setStatus('播放源已就绪，请点击视频控件播放');
        });
      });

      hls.on(Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal) {
          setStatus('播放源加载失败，请刷新页面重试');
        }
      });
    } else {
      video.src = source;
      setStatus('当前浏览器不支持 HLS.js，已尝试直接播放');
      video.play().catch(function () {
        setStatus('请使用支持 HLS 的现代浏览器播放');
      });
    }
  }

  button.addEventListener('click', initialize);
  video.addEventListener('play', function () {
    button.classList.add('hidden');
  });
}

document.addEventListener('DOMContentLoaded', setupPlayer);
