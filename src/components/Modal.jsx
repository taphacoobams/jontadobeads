import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

/**
 * Fenêtre accessible sur <dialog> natif : focus piégé, Échap, fond inerte, retour du focus.
 * variant 'drawer' : panneau latéral (panier, menu, filtres) ; 'center' : fenêtre centrée
 * (fiche produit, commande), plein écran sur mobile.
 * Les transitions sont en CSS (voir .modal dans main.css).
 */
export default function Modal({ open, onClose, label, labelledBy, variant = 'drawer', side = 'right', className = '', closeLabel = 'Fermer', children, testId }) {
  const ref = useRef(null);
  const opener = useRef(null);
  const [mounted, setMounted] = useState(open);

  useEffect(() => { if (open) setMounted(true); }, [open]);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return undefined;
    if (open && mounted && !dlg.open) {
      opener.current = document.activeElement;
      dlg.showModal();
      document.documentElement.classList.add('has-modal');
      requestAnimationFrame(() => dlg.setAttribute('data-shown', ''));
    }
    if (!open && dlg.open) {
      dlg.removeAttribute('data-shown');
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const t = setTimeout(() => {
        dlg.close();
        setMounted(false);
        // Une autre fenêtre peut s'être ouverte entre-temps (panier → commande) : on garde alors le verrou.
        if (!document.querySelector('dialog[open]')) document.documentElement.classList.remove('has-modal');
        const back = opener.current;
        if (back && document.contains(back)) back.focus({ preventScroll: true });
      }, reduce ? 0 : 260);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open, mounted]);

  useEffect(() => () => document.documentElement.classList.remove('has-modal'), []);

  if (!mounted) return null;
  return (
    <dialog
      ref={ref}
      className={`modal modal--${variant} modal--${side} ${className}`}
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      data-testid={testId}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal__panel">
        <button type="button" className="icon-btn modal__close" onClick={onClose} aria-label={closeLabel}>
          <X size={22} strokeWidth={1.5} aria-hidden="true" />
        </button>
        {children}
      </div>
    </dialog>
  );
}
