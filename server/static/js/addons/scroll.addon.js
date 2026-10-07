const __scroll = {
  from : window.scrollY,
  to   : window.scrollY,
  is   : false,
  speed: .1,
};

function smoothScroll() {
  const delta = __scroll.to - __scroll.from;

  __scroll.from += delta * __scroll.speed;

  window.scrollTo(0, __scroll.from);

  if (Math.abs(delta) > .5) { requestAnimationFrame(smoothScroll); }
  else {
    __scroll.from = __scroll.to;
    window.scrollTo(0, __scroll.from);
    __scroll.is = false;
  }
}

window.addEventListener('wheel', e => {
  e.preventDefault();

  __scroll.to += e.deltaY;
  __scroll.to = Math.max(
    0,
    Math.min(__scroll.to, document.documentElement.scrollHeight - window.innerHeight)
  );

  if (!__scroll.is) {
    __scroll.is = true;
    smoothScroll();
  }
}, { passive: false });
