import Photo from './Photo.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { useProductModal } from '../context/ProductModalContext.jsx';
import { displayName, saleState, isPurchasable } from '../lib/catalogue.js';
import { money } from '../lib/format.js';

/**
 * Carte produit : toute la carte ouvre la fiche en fenêtre. Le prix n'apparaît que pour un modèle
 * achetable ; un modèle en préparation affiche « Bientôt disponible », jamais un prix inventé.
 */
export default function ProductCard({ product: p, eager = false, sizes }) {
  const { catalogue, settings } = useStore();
  const { openProduct } = useProductModal();
  const [main, second] = catalogue.photosOf(p);
  const state = saleState(p);
  const buyable = isPurchasable(p);
  const name = displayName(p);
  const showCompare = buyable && Number.isFinite(p.compareAtPrice) && p.compareAtPrice > p.price;

  return (
    <article className={`card${second ? ' card--duo' : ''}`} data-ref={p.reference} data-state={state.id}>
      <button type="button" className="card__link" onClick={() => openProduct(p.id)} aria-haspopup="dialog">
        <span className="card__media">
          <Photo photo={main} eager={eager} sizes={sizes ?? '(min-width: 72rem) 22vw, (min-width: 40rem) 30vw, 46vw'} />
          {second && <Photo photo={second} className="card__alt" sizes={sizes ?? '(min-width: 72rem) 22vw, 30vw'} />}
          {state.id !== 'ok' && <span className={`card__tag card__tag--${state.id}`}>{state.label}</span>}
        </span>
        <span className="card__body">
          <span className="card__meta">{catalogue.getCategory(p.category)?.singular ?? ''}{p.name ? ` · ${p.reference}` : ''}</span>
          <span className="card__name">{name}</span>
          {buyable ? (
            <span className="card__price">
              {p.priceLabel === 'from' && 'À partir de '}{money(p.price, settings.commerce)}{p.priceLabel === 'unit' && ' l’unité'}
              {showCompare && <s className="card__compare"><span className="visually-hidden">au lieu de </span>{money(p.compareAtPrice, settings.commerce)}</s>}
            </span>
          ) : (
            <span className="card__price card__price--soon">Prix à venir</span>
          )}
        </span>
      </button>
    </article>
  );
}
