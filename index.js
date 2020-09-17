let isSafari =
  navigator.userAgent.indexOf("Safari") != -1 &&
  navigator.userAgent.indexOf("Chrome") == -1;

let prevTag;

let items = document.querySelectorAll(".item");
let initial = document.querySelector(".main");

let buttons = document.querySelectorAll(".menu a");
console.log(items);
function show(btn, tag) {
  window.scrollTo(0, 0);
  items.forEach((e) => e.classList.remove("show"));

  buttons.forEach((e) => e.classList.remove("active"));
  let elem = document.querySelector(tag);

  if (prevTag != elem) {
    elem.classList.add("show");

    btn.classList.add("active");
    document.body.style.backgroundColor = "#1a1a1a";

    prevTag = elem;
  } else {
    initial.classList.add("show");
    document.body.style.backgroundColor = "white";
    prevTag = undefined;
  }
}

let options = {
  root: null,
  rootMargin: "0px",
  threshold: 0.5,
};

if (isSafari) options.threshold = 1;

let playVideo = function (entries, observer) {
  for (let entry of entries) {
    if (entry.target.paused) {
      entry.target.play();
    } else {
      entry.target.pause();
    }
  }
};

let observer = new IntersectionObserver(playVideo, options);

let videos = document.querySelectorAll("video.pic");

for (let video of videos) {
  observer.observe(video);
}
