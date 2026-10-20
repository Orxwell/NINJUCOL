const $button_alt_nav = document.getElementById('alt-nav');
const $nav = document.getElementById('alt');

$button_alt_nav.addEventListener('click', () => {
  $button_alt_nav.toggleAttribute('active');
  $nav.toggleAttribute('active');
});
