import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2 } from 'lucide-react';
import Modal from './Modal.jsx';
import Photo from './Photo.jsx';
import PaymentLogos from './PaymentLogos.jsx';
import { QuantityStepper } from './ui.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { useProductModal } from '../context/ProductModalContext.jsx';
import { displayName } from '../lib/catalogue.js';
import { money, plural } from '../lib/format.js';
import { canOrder } from '../services/checkout.js';

/** Panier en panneau latéral (plein écran sur mobile), comme Senemaille. */
export default function CartDrawer() {
  const { summary, setQty, remove, removeUnavailable, clear, drawerOpen, closeDrawer, openCheckout, announce } = useCart();
  const { catalogue, settings } = useStore();
  const { openProduct } = useProductModal();
  const [confirmClear, setConfirmClear] = useState(false);
  const m = (n) => money(n, settings.commerce);
  const { items, subtotal, count } = summary;

  useEffect(() => {
    if (!confirmClear) return undefined;
    const t = setTimeout(() => setConfirmClear(false), 4000);
    return () => clearTimeout(t);
  }, [confirmClear]);

  return (
    <Modal open={drawerOpen} onClose={closeDrawer} variant="drawer" labelledBy="panier-titre" closeLabel="Fermer le panier" testId="cart">
      <div className="sheet">
        <div className="sheet__head">
          <h2 className="sheet__title" id="panier-titre">Votre panier</h2>
          {count > 0 && <p className="sheet__count">{plural(count, 'article', 'articles')}</p>}
        </div>

        <div className="sheet__body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={36} strokeWidth={1.3} aria-hidden="true" />
              <p className="cart-empty__title">Votre panier est vide.</p>
              <p>Parcourez la boutique pour ajouter des modèles.</p>
              <Link className="btn btn--ghost" to="/boutique" onClick={closeDrawer}>Parcourir la boutique</Link>
            </div>
          ) : (
            <>
              {summary.hasUnavailable && (
                <div className="notice notice--warn" role="alert">
                  <p>Certains articles ne sont plus disponibles et ne seront pas commandés.</p>
                  <button type="button" className="link-btn" onClick={() => { removeUnavailable(); announce('Articles indisponibles retirés.'); }}>Les retirer du panier</button>
                </div>
              )}
              <ul className="lines">
                {items.map((it) => {
                  const p = it.product;
                  const name = p ? displayName(p) : 'Article retiré du catalogue';
                  return (
                    <li key={`${it.id}-${it.variant?.id ?? ''}`} className={`line${it.available ? '' : ' is-unavailable'}`}>
                      <button type="button" className="line__media" tabIndex={-1} aria-hidden="true" onClick={() => { if (p) { closeDrawer(); setTimeout(() => openProduct(p.id), 300); } }}>
                        {p && <Photo photo={catalogue.photosOf(p)[0]} sizes="96px" />}
                      </button>
                      <div className="line__body">
                        <h3 className="line__name">{name}</h3>
                        <p className="line__meta">{p ? `Réf. ${p.reference}` : ''}{it.variant ? ` · ${it.variant.label}` : ''}</p>
                        {it.available ? <p className="line__unit">{m(it.unitPrice)} l’unité</p> : <p className="line__warn">Indisponible</p>}
                        <div className="line__row">
                          {it.available && <QuantityStepper small value={it.qty} max={it.max} onChange={(n) => setQty(it.index, n)} label={`Quantité pour ${name}`} />}
                          {it.available && <p className="line__total">{m(it.lineTotal)}</p>}
                        </div>
                        <button type="button" className="link-btn line__remove" onClick={() => { remove(it.index); announce(`« ${name} » retiré du panier.`); }}>
                          <Trash2 size={15} aria-hidden="true" /> Supprimer<span className="visually-hidden"> {name}</span>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="sheet__foot">
            <dl className="totals">
              <div><dt>Sous-total</dt><dd data-testid="cart-subtotal">{m(subtotal)}</dd></div>
              <div><dt>Livraison</dt><dd>{settings.delivery.feeLabel}</dd></div>
              <div className="totals__total"><dt>Total</dt><dd data-testid="cart-total">{m(subtotal)}</dd></div>
            </dl>
            {count > 0 && canOrder(settings) ? (
              <button type="button" className="btn btn--block" onClick={openCheckout}>Commander</button>
            ) : count > 0 ? (
              <p className="notice">La commande en ligne ouvrira très prochainement. Votre panier reste enregistré sur cet appareil.</p>
            ) : null}
            <div className="sheet__pay">
              <PaymentLogos />
              <p>Vos coordonnées et votre adresse sont demandées à l’étape suivante.</p>
            </div>
            <button
              type="button"
              className={`link-btn${confirmClear ? ' is-danger' : ''}`}
              onClick={() => { if (!confirmClear) { setConfirmClear(true); return; } setConfirmClear(false); clear(); announce('Panier vidé.'); }}
            >
              {confirmClear ? 'Confirmer : vider le panier' : 'Vider le panier'}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
