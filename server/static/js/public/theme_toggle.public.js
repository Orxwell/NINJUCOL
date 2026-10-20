const theme_toggle = document.getElementById('theme-toggle');
const root = document.documentElement;

const saved_theme = localStorage.getItem('theme');
if (saved_theme) { root.dataset.theme = saved_theme; }

theme_toggle.addEventListener('click', () => {
  const setted_theme = root.dataset.theme === 'dark'
    ? 'light'
    : 'dark';
    
  root.dataset.theme = setted_theme;

  localStorage.setItem('theme', setted_theme);
});
