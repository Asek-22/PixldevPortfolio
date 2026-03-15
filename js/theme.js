/**
 * theme.js — Dark / Light mode toggle
 */
(function () {
  const btn  = document.getElementById('themeBtn');
  const moon = btn.querySelector('.icon-moon');
  const sun  = btn.querySelector('.icon-sun');

  function applyTheme(isLight) {
    document.body.classList.toggle('light', isLight);
    moon.style.display = isLight ? 'none' : '';
    sun.style.display  = isLight ? ''     : 'none';
  }

  applyTheme(localStorage.getItem('theme') === 'light');

  btn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light');
    moon.style.display = isLight ? 'none' : '';
    sun.style.display  = isLight ? ''     : 'none';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
})();
