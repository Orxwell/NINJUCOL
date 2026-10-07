const $checkbox = document.getElementById('checkbox');

$checkbox.addEventListener('change', () => {
  if ($checkbox.checked) chckbx.setAttribute('on', '');
  else $checkbox.removeAttribute('on');
});
