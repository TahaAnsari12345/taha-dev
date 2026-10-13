// Runs before first paint (blocking, same-origin so it passes the CSP): applies the saved or
// system theme so there is never a flash of the wrong colours.
(function () {
  try {
    var t = localStorage.getItem('theme');
    if (t !== 'light' && t !== 'dark') t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    var r = document.documentElement;
    r.setAttribute('data-theme', t);
    r.classList.toggle('dark', t === 'dark');
    r.style.colorScheme = t;
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', t === 'dark' ? '#0f172a' : '#f1f5f9');
  } catch (e) {}
})();
