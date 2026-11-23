import { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext.jsx';

/**
 * Introduction de marque, construite sur le logo réel (même déroulé que Senemaille, en CSS pur) :
 *  1. le fond ébène s'ouvre en cercle sur la nacre ;
 *  2. la silhouette du logo apparaît ;
 *  3. le nom « Jontado Bead's » se révèle de gauche à droite, comme tracé à la plume (masque + pointe) ;
 *  4. le slogan apparaît mot à mot ;
 *  5. le rideau se lève vers la page.
 * Jouée à chaque arrivée sur le site (chargement ou actualisation), jamais lors d'un changement de page.
 * Non jouée si le système demande moins d'animations, ni dans les tests automatisés (navigator.webdriver).
 * Un clic ou une touche la passe.
 */
const shouldPlay = () => typeof window !== 'undefined'
  && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  && !navigator.webdriver
  && !window.__JDB_NO_INTRO__;

export default function IntroSplash() {
  const { settings } = useStore();
  const [state, setState] = useState(() => (shouldPlay() ? 'play' : 'gone'));

  useEffect(() => {
    if (state === 'gone') { document.documentElement.classList.remove('has-intro'); return undefined; }
    document.documentElement.classList.add('has-intro');
    const skip = () => setState((s) => (s === 'play' ? 'skip' : s));
    window.addEventListener('keydown', skip);
    return () => window.removeEventListener('keydown', skip);
  }, [state]);

  if (state === 'gone') return null;
  const tagline = settings.shop.tagline ?? '';
  return (
    <div
      className={`intro${state === 'skip' ? ' intro--skip' : ''}`}
      data-testid="intro"
      role="region"
      aria-label={`Introduction ${settings.shop.name}`}
      onClick={() => setState('skip')}
      onAnimationEnd={(e) => { if (e.target === e.currentTarget && e.animationName === 'intro-out') setState('gone'); }}
    >
      <div className="intro__light" aria-hidden="true" />
      <div className="intro__stage">
        <img className="intro__figure on-light-theme" src="/images/brand/silhouette.png" width="315" height="393" alt="" fetchPriority="high" />
        <img className="intro__figure on-dark-theme" src="/images/brand/silhouette-sombre.png" width="315" height="394" alt="" />
        <div className="intro__mark">
          <img className="intro__name on-light-theme" src="/images/brand/nom-clair.png" width="593" height="96" alt={settings.shop.name} fetchPriority="high" />
          <img className="intro__name on-dark-theme" src="/images/brand/nom-sombre.png" width="594" height="96" alt={settings.shop.name} />
          <span className="intro__nib" aria-hidden="true" />
        </div>
        {tagline && (
          <p className="intro__tagline" aria-hidden="true">
            {tagline.split(' ').map((w, i) => (
              <span key={i} className="intro__mask"><span className="intro__word" style={{ animationDelay: `${2.15 + i * 0.07}s` }}>{w}</span></span>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}
