import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { STORAGE_KEYS } from '../../config/site.js';

/**
 * Bascule clair / sombre. Le thème initial est posé avant l'affichage par le script de index.html
 * (choix mémorisé, sinon réglage du système). Le choix fait ici est mémorisé sur l'appareil.
 */
const current = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#1D1411' : '#F7F1EB');
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(current);

  // Suit le réglage du système tant que la personne n'a rien choisi.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => {
      let saved = null;
      try { saved = localStorage.getItem(STORAGE_KEYS.theme); } catch { /* stockage bloqué */ }
      if (saved) return;
      const next = e.matches ? 'dark' : 'light';
      applyTheme(next);
      setTheme(next);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
    try { localStorage.setItem(STORAGE_KEYS.theme, next); } catch { /* stockage bloqué : le choix vaut pour la visite */ }
  };

  const dark = theme === 'dark';
  return (
    <button type="button" className="icon-btn theme-btn" onClick={toggle} aria-label={dark ? 'Passer en mode clair' : 'Passer en mode sombre'} title={dark ? 'Mode clair' : 'Mode sombre'}>
      {dark ? <Sun size={20} strokeWidth={1.5} aria-hidden="true" /> : <Moon size={20} strokeWidth={1.5} aria-hidden="true" />}
    </button>
  );
}
