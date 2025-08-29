// Tema yönetimi + ilk yükte sistem tercihi
export function setupThemeToggle() {
  const root = document.documentElement;
  const stored = localStorage.getItem('theme');
  if (stored) {
    root.classList.toggle('dark', stored === 'dark');
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    root.classList.add('dark');
  }
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.addEventListener('click', () => {
      root.classList.toggle('dark');
      localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
    });
  }
}
window.setupThemeToggle = setupThemeToggle;