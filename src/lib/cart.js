// Panier : fonctions pures (réducteur, calculs, persistance). Utilisé par CartContext.
import { STORAGE_KEYS } from '../config/site.js';
import { readJSON, writeJSON } from './storage.js';
import { isPurchasable, maxQty } from './catalogue.js';

export function loadCart() {
  const raw = readJSON(STORAGE_KEYS.cart, []);
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((l) => typeof l?.id === 'string')
    .map((l) => ({ id: l.id, variant: typeof l.variant === 'string' ? l.variant : null, qty: Math.max(1, Math.min(20, Number(l.qty) || 1)) }));
}

export const saveCart = (lines) => writeJSON(STORAGE_KEYS.cart, lines);

const same = (l, id, variant) => l.id === id && (l.variant ?? null) === (variant ?? null);

export function cartReducer(lines, action) {
  switch (action.type) {
    case 'add': {
      const qty = Math.max(1, action.qty || 1);
      const i = lines.findIndex((l) => same(l, action.id, action.variant));
      if (i >= 0) return lines.map((l, j) => (j === i ? { ...l, qty: Math.min(action.max ?? 20, l.qty + qty) } : l));
      return [...lines, { id: action.id, variant: action.variant ?? null, qty: Math.min(action.max ?? 20, qty) }];
    }
    case 'setQty':
      return lines.map((l, i) => (i === action.index ? { ...l, qty: Math.max(1, Math.min(action.max ?? 20, action.qty)) } : l));
    case 'remove':
      return lines.filter((_, i) => i !== action.index);
    case 'clear':
      return [];
    case 'replace':
      return action.lines;
    default:
      return lines;
  }
}

/** Prix unitaire d'une ligne : celui de la variante s'il est renseigné, sinon celui du modèle. */
export function unitPrice(product, variantId) {
  const v = variantId ? product.variants?.find((x) => x.id === variantId) : null;
  return Number.isFinite(v?.price) ? v.price : product.price;
}

/**
 * Lignes enrichies et totaux. Une ligne dont le modèle n'est plus achetable (retiré, dépublié,
 * épuisé) est marquée « unavailable » et exclue des totaux et de la commande.
 */
export function summarize(lines, getProduct) {
  const items = lines.map((l, index) => {
    const product = getProduct(l.id);
    const available = Boolean(product) && isPurchasable(product) && (!l.variant || product.variants?.some((v) => v.id === l.variant));
    const price = available ? unitPrice(product, l.variant) : null;
    const variant = product && l.variant ? product.variants?.find((v) => v.id === l.variant) ?? null : null;
    return { ...l, index, product, variant, available, unitPrice: price, max: product ? maxQty(product) : 0, lineTotal: available ? price * l.qty : 0 };
  });
  const valid = items.filter((i) => i.available);
  const subtotal = valid.reduce((s, i) => s + i.lineTotal, 0);
  return {
    items,
    valid,
    hasUnavailable: items.length !== valid.length,
    subtotal,
    count: valid.reduce((s, i) => s + i.qty, 0),
  };
}
