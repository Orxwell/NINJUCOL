const $button_alt_nav = document.getElementById('alt-nav');
const $nav = document.getElementById('alt');
const $header = document.getElementById('bar');

if ($button_alt_nav && $nav) {
  $button_alt_nav.addEventListener('click', (e) => {
    e.stopPropagation();
    
    $button_alt_nav.toggleAttribute('active');
    $nav.toggleAttribute('active');
        if ($header) {
      $header.classList.toggle('menu-open');
    }
  });

  document.addEventListener('click', (e) => {
    if ($header && !$header.contains(e.target)) {
      $button_alt_nav.removeAttribute('active');
      $nav.removeAttribute('active');
      $header.classList.remove('menu-open');
    }
  });
}