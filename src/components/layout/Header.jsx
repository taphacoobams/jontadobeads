import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Menu } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { plural } from '../../lib/format.js';
import Logo from './Logo.jsx';
import MobileMenu from './MobileMenu.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export const NAV = [
  { to: '/boutique', label: 'Boutique' },
  { to: '/blog', label: 'Blog' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const { summary, openDrawer } = useCart();
  const { pathname } = useLocation();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const active = (n) => pathname.startsWith(n.to);

  return (
    <>
      <a className="skip" href="#contenu">Aller au contenu</a>
      <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="container site-header__bar">
          <button type="button" className="icon-btn menu-btn" onClick={() => setMenu(true)} aria-haspopup="dialog" aria-label="Ouvrir le menu">
            <Menu size={22} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <Link className="brand" to="/"><Logo /><span className="visually-hidden"> (accueil)</span></Link>
          <nav className="site-nav" aria-label="Navigation principale">
            <ul>
              {NAV.map((n) => (
                <li key={n.label}>
                  <NavLink to={n.to} className={() => (active(n) ? 'active' : '')} aria-current={active(n) ? 'page' : undefined}>{n.label}</NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="site-actions">
            <ThemeToggle />
            <Link className="icon-btn" to="/boutique?recherche=1" aria-label="Rechercher un modèle">
              <Search size={21} strokeWidth={1.5} aria-hidden="true" />
            </Link>
            <button type="button" className="icon-btn cart-btn" onClick={openDrawer} aria-haspopup="dialog" aria-label={`Ouvrir le panier, ${plural(summary.count, 'article', 'articles')}`}>
              <ShoppingBag size={21} strokeWidth={1.5} aria-hidden="true" />
              {summary.count > 0 && <span className="count-badge" data-testid="cart-count">{summary.count}</span>}
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menu} onClose={() => setMenu(false)} />
    </>
  );
}
