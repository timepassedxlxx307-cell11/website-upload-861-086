import { H as Hls } from "./hls-vendor-dru42stk.js";

export function setupMoviePlayer(videoId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var hls = null;
    var initialized = false;

    function attachStream() {
        if (!video || initialized) {
            return;
        }

        initialized = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            video.hlsInstance = hls;
        } else {
            video.src = streamUrl;
        }
    }

    function startPlayback() {
        if (!video) {
            return;
        }

        attachStream();
        video.setAttribute("controls", "controls");

        if (button) {
            button.classList.add("is-hidden");
        }

        var playback = video.play();

        if (playback && typeof playback.catch === "function") {
            playback.catch(function () {
                if (button) {
                    button.classList.remove("is-hidden");
                }
            });
        }
    }

    if (button) {
        button.addEventListener("click", startPlayback);
    }

    if (video) {
        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });
    }

    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
