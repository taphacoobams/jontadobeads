import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { cartReducer, loadCart, saveCart, summarize } from '../lib/cart.js';
import { isPurchasable, maxQty } from '../lib/catalogue.js';
import { STORAGE_KEYS } from '../config/site.js';
import { useStore } from './StoreContext.jsx';

const CartContext = createContext(null);

/** Panier, panneau latéral du panier et fenêtre de commande (comme Senemaille). */
export function CartProvider({ children }) {
  const { catalogue } = useStore();
  const [lines, dispatch] = useReducer(cartReducer, undefined, loadCart);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => { saveCart(lines); }, [lines]);

  // Synchronise plusieurs onglets ouverts.
  useEffect(() => {
    const onStorage = (e) => { if (e.key === STORAGE_KEYS.cart) dispatch({ type: 'replace', lines: loadCart() }); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  /** Message lu par les lecteurs d'écran. */
  const announce = useCallback((msg) => {
    setAnnouncement('');
    requestAnimationFrame(() => setAnnouncement(msg));
  }, []);

  const summary = useMemo(() => summarize(lines, catalogue.getProduct), [lines, catalogue]);

  const add = useCallback((product, qty = 1, variant = null) => {
    if (!isPurchasable(product)) return false;
    dispatch({ type: 'add', id: product.id, variant, qty, max: maxQty(product) });
    return true;
  }, []);

  const value = useMemo(() => ({
    lines,
    summary,
    add,
    setQty: (index, qty) => dispatch({ type: 'setQty', index, qty, max: summary.items[index]?.max || 20 }),
    remove: (index) => dispatch({ type: 'remove', index }),
    removeUnavailable: () => dispatch({ type: 'replace', lines: summary.items.filter((i) => i.available).map(({ id, variant, qty }) => ({ id, variant, qty })) }),
    clear: () => dispatch({ type: 'clear' }),
    drawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
    checkoutOpen,
    openCheckout: () => { setDrawerOpen(false); setCheckoutOpen(true); },
    closeCheckout: () => setCheckoutOpen(false),
    announcement,
    announce,
  }), [lines, summary, add, drawerOpen, checkoutOpen, announcement, announce]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être utilisé dans <CartProvider>');
  return ctx;
}
