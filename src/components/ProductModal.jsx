import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import Modal from './Modal.jsx';
import ProductGallery from './ProductGallery.jsx';
import PaymentLogos from './PaymentLogos.jsx';
import WhatsAppIcon from './WhatsAppIcon.jsx';
import { QuantityStepper } from './ui.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useProductModal } from '../context/ProductModalContext.jsx';
import { displayName, isPurchasable, saleState, maxQty } from '../lib/catalogue.js';
import { unitPrice } from '../lib/cart.js';
import { money } from '../lib/format.js';
import { waLink } from '../services/checkout.js';

/** Fiche produit en fenêtre (aucune page individuelle par produit), comme Senemaille. */
export default function ProductModal() {
  const { id, closeProduct } = useProductModal();
  const { catalogue } = useStore();
  const p = id ? catalogue.getProduct(id) : null;
  // Garde le contenu affiché pendant l'animation de fermeture.
  const [shown, setShown] = useState(p);
  useEffect(() => { if (p) setShown(p); }, [p]);
  return (
    <Modal open={Boolean(p)} onClose={closeProduct} variant="center" labelledBy="produit-titre" className="product-modal" closeLabel="Fermer la fiche produit" testId="product-modal">
      {shown && <ProductDetail key={shown.id} p={shown} onClose={closeProduct} />}
    </Modal>
  );
}

function ProductDetail({ p, onClose }) {
  const { catalogue, settings } = useStore();
  const { add, openDrawer, announce } = useCart();
  const name = displayName(p);
  const cat = catalogue.getCategory(p.category);
  const collection = catalogue.collections.find((c) => c.products.includes(p.id));
  const state = saleState(p);
  const buyable = isPurchasable(p);
  const hasVariants = p.variants?.length > 0;
  const [variant, setVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  const price = buyable ? unitPrice(p, variant) : null;
  const max = Math.max(1, maxQty(p));
  const ask = waLink(settings, `Bonjour ${settings.shop.name}, j'aimerais des informations sur le modèle ${p.reference}.`);

  useEffect(() => setAdded(false), [qty, variant]);

  const submit = (e) => {
    e.preventDefault();
    if (hasVariants && !variant) { setError('Choisissez une option.'); return; }
    if (add(p, qty, variant)) {
      setAdded(true);
      announce(`${qty} × « ${name} » ajouté au panier.`);
    }
  };

  const facts = [
    ['Catégorie', cat?.label],
    ['Collection', collection?.title],
    ['Couleurs', p.colors?.length ? p.colors.join(', ') : null],
    ['Tailles', p.sizes?.length ? p.sizes.join(', ') : null],
    ['Disponibilité', state.label],
  ].filter(([, v]) => v);

  return (
    <div className="pdp">
      <div className="pdp__media"><ProductGallery photos={catalogue.photosOf(p)} name={name} /></div>
      <div className="pdp__info">
        <p className="eyebrow">{cat?.singular} <span aria-hidden="true">/</span> Réf. {p.reference}</p>
        <h2 className="pdp__title" id="produit-titre">{name}</h2>
        {buyable ? (
          <p className="pdp__price">
            {p.priceLabel === 'from' && 'À partir de '}{money(price, settings.commerce)}{p.priceLabel === 'unit' && ' l’unité'}
            {Number.isFinite(p.compareAtPrice) && p.compareAtPrice > p.price && <s><span className="visually-hidden">au lieu de </span>{money(p.compareAtPrice, settings.commerce)}</s>}
          </p>
        ) : (
          <p className="pdp__price pdp__price--soon">Prix à venir</p>
        )}
        {p.shortDescription && <p className="pdp__short">{p.shortDescription}</p>}
        {p.description && <div className="pdp__desc">{p.description.split(/\n{2,}/).map((t) => <p key={t.slice(0, 24)}>{t}</p>)}</div>}

        <dl className="pdp__facts">
          {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd className={k === 'Disponibilité' ? `is-${state.id}` : undefined}>{v}</dd></div>)}
        </dl>

        {buyable ? (
          added ? (
            <div className="pdp__added" role="status">
              <p><span className="pdp__check"><Check size={16} aria-hidden="true" /></span> {qty} × « {name} » ajouté au panier.</p>
              <div className="pdp__actions">
                <button type="button" className="btn btn--ghost" onClick={onClose}>Continuer mes achats</button>
                <button type="button" className="btn" onClick={() => { onClose(); setTimeout(openDrawer, 300); }}>Voir le panier</button>
              </div>
            </div>
          ) : (
            <form className="pdp__form" onSubmit={submit} noValidate>
              {hasVariants && (
                <fieldset className={`variants${error ? ' has-error' : ''}`}>
                  <legend>Option</legend>
                  <div className="variants__list">
                    {p.variants.map((v) => (
                      <label key={v.id} className="variant">
                        <input type="radio" name="variante" value={v.id} checked={variant === v.id} onChange={() => { setVariant(v.id); setError(''); }} disabled={v.stock === 0} />
                        <span>{v.label}</span>
                      </label>
                    ))}
                  </div>
                  {error && <p className="field__error" role="alert">{error}</p>}
                </fieldset>
              )}
              <div className="pdp__row">
                <QuantityStepper value={qty} onChange={(n) => setQty(Math.max(1, Math.min(max, n)))} max={max} label="Quantité" />
                <button type="submit" className="btn btn--grow">Ajouter au panier · {money(price * qty, settings.commerce)}</button>
              </div>
            </form>
          )
        ) : (
          <div className="pdp__soon">
            <p>Ce modèle sera bientôt proposé à la vente : son nom, son prix et sa description sont en préparation.</p>
            {ask && <a className="btn btn--whatsapp" href={ask} target="_blank" rel="noopener noreferrer"><WhatsAppIcon /> Demander des informations</a>}
          </div>
        )}

        <div className="pdp__pay">
          <PaymentLogos />
          <p>Commande confirmée sur WhatsApp, paiement Wave ou Orange Money. <Link to="/livraison-retours" onClick={onClose}>Livraison et retours</Link></p>
        </div>
      </div>
    </div>
  );
}
