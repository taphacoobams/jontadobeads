import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import CartDrawer from '../CartDrawer.jsx';
import ProductModal from '../ProductModal.jsx';
import CheckoutModal from '../checkout/CheckoutModal.jsx';
import { useCart } from '../../context/CartContext.jsx';
import IntroSplash from '../intro/IntroSplash.jsx';

/** À chaque nouvelle page : retour en haut et focus sur le contenu (lecteurs d'écran). */
function ScrollManager() {
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    window.scrollTo(0, 0);
    if (first.current) { first.current = false; return; }
    document.getElementById('contenu')?.focus({ preventScroll: true });
  }, [pathname]);
  return null;
}

export default function Layout() {
  const { announcement } = useCart();
  return (
    <>
      <IntroSplash />
      <ScrollManager />
      <Header />
      <main id="contenu" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <ProductModal />
      <CheckoutModal />
      <p className="visually-hidden" aria-live="polite" data-testid="announcer">{announcement}</p>
    </>
  );
}
