// Keep the same content in both contact layouts, including when resizing.
const desktop = window.matchMedia('(min-width: 1100px)');
function arrangeContacts() {
  document.querySelectorAll('.resume-grid').forEach(grid => {
    const mentions = grid.querySelector('.mentions');
    const destination = grid.querySelector(desktop.matches ? '.awards-column--americas' : '.details');
    if (mentions && destination) destination.append(mentions);
  });
}
arrangeContacts();
desktop.addEventListener('change', arrangeContacts);

const hero = document.querySelector('.hero');
if (hero) {
  const introCopy = hero.querySelector('.hero-copy');
  const updatePortraitStart = () => {
    hero.style.setProperty('--portrait-start', `${introCopy.offsetTop + introCopy.getBoundingClientRect().height + 24}px`);
  };
  new ResizeObserver(updatePortraitStart).observe(introCopy);
  window.addEventListener('resize', updatePortraitStart);
  updatePortraitStart();
  let front = 10;
  const positions = new Map();
  const items = [...hero.querySelectorAll('.collage-item')];
  const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max));
  function move(item, x, y) {
    const previous = positions.get(item) || { x: 0, y: 0 };
    const bounds = hero.getBoundingClientRect();
    const firstImage = document.querySelector('#paysend .project-media > img');
    const lowerEdge = firstImage ? firstImage.getBoundingClientRect().top : bounds.bottom;
    const dragHeight = lowerEdge - bounds.top;
    const rect = item.getBoundingClientRect();
    const originX = rect.left - bounds.left - previous.x;
    const originY = rect.top - bounds.top - previous.y;
    const position = {
      x: clamp(x, -originX, bounds.width - rect.width - originX),
      y: clamp(y, -originY, dragHeight - rect.height - originY),
    };
    positions.set(item, position);
    item.style.translate = `${position.x}px ${position.y}px`;
  }
  function reset(item) {
    positions.delete(item);
    item.style.removeProperty('translate');
    item.style.removeProperty('z-index');
  }
  items.forEach(item => {
    let drag;
    item.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return;
      const position = positions.get(item) || { x: 0, y: 0 };
      drag = { id: event.pointerId, clientX: event.clientX, clientY: event.clientY, ...position };
      item.setPointerCapture(event.pointerId);
      item.style.zIndex = ++front;
      item.classList.add('is-dragging');
      item.focus({ preventScroll: true });
      event.preventDefault();
    });
    item.addEventListener('pointermove', event => {
      if (!drag || drag.id !== event.pointerId) return;
      move(item, drag.x + event.clientX - drag.clientX, drag.y + event.clientY - drag.clientY);
    });
    const stop = () => { drag = null; item.classList.remove('is-dragging'); };
    item.addEventListener('pointerup', stop);
    item.addEventListener('pointercancel', stop);
    item.addEventListener('lostpointercapture', stop);
    item.addEventListener('keydown', event => {
      if (event.key === 'Escape') { reset(item); return; }
      const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      const direction = directions[event.key];
      if (!direction) return;
      event.preventDefault();
      const position = positions.get(item) || { x: 0, y: 0 };
      const step = event.shiftKey ? 30 : 10;
      item.style.zIndex = ++front;
      move(item, position.x + direction[0] * step, position.y + direction[1] * step);
    });
  });
  let lastWidth = hero.clientWidth;
  new ResizeObserver(() => {
    if (hero.clientWidth !== lastWidth) {
      items.forEach(reset);
      lastWidth = hero.clientWidth;
    }
  }).observe(hero);
}

// Animate visible videos only, and respect the visitor's motion preference.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const videos = [...document.querySelectorAll('video')];
const visibleVideos = new Set();
function updatePlayback() {
  videos.forEach(video => {
    if (!reducedMotion.matches && !document.hidden && visibleVideos.has(video) && video.getBoundingClientRect().width) {
      video.play().catch(() => {});
    } else video.pause();
  });
}
const videoObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => entry.isIntersecting ? visibleVideos.add(entry.target) : visibleVideos.delete(entry.target));
  updatePlayback();
}, { rootMargin: '100px' });
videos.forEach(video => videoObserver.observe(video));
reducedMotion.addEventListener('change', updatePlayback);
document.addEventListener('visibilitychange', updatePlayback);

// Reserve space for the actual number of rows in the floating contact bar.
const contactBar = document.querySelector('.contact-links');
if (contactBar) {
  new ResizeObserver(() => {
    document.documentElement.style.setProperty('--contact-bar-height', `${contactBar.getBoundingClientRect().height}px`);
  }).observe(contactBar);
}

// Reveal the floating links after scrolling through 80% of the introduction.
if (contactBar && hero) {
  let visibilityFrame = 0;
  function updateContactVisibility() {
    visibilityFrame = 0;
    const bounds = hero.getBoundingClientRect();
    const visible = bounds.bottom <= bounds.height * 0.2;
    contactBar.classList.toggle('is-visible', visible);
    contactBar.inert = !visible;
    contactBar.setAttribute('aria-hidden', String(!visible));
  }
  function scheduleContactVisibility() {
    if (!visibilityFrame) visibilityFrame = requestAnimationFrame(updateContactVisibility);
  }
  window.addEventListener('scroll', scheduleContactVisibility, { passive: true });
  window.addEventListener('resize', scheduleContactVisibility);
  window.addEventListener('pageshow', scheduleContactVisibility);
  new ResizeObserver(scheduleContactVisibility).observe(hero);
  updateContactVisibility();
}
