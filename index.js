const isSafari =
  navigator.userAgent.indexOf("Safari") != -1 &&
  navigator.userAgent.indexOf("Chrome") == -1;

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent
);

const isIPadOS =
  navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

let options = {
  root: null,
  rootMargin: "0px",
  threshold: 0.5,
};

let playVideo = function (entries, observer) {
  for (let entry of entries) {
    if (entry.target.autoplay) {
      entry.target.autoplay = false;
    } else {
      entry.target.autoplay = true;
    }
  }
};

let observer = new IntersectionObserver(playVideo, options);

let videos = document.querySelectorAll("video.pic");

for (let video of videos) {
  if (isMobile || isIPadOS) {
    video.controls = true;
  } else {
    observer.observe(video);
  }
}
