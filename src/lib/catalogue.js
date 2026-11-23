// Règles du catalogue : fonctions pures, sans état. Les données arrivent de StoreContext
// (fichiers JSON de src/data).
import { AVAILABILITY } from '../config/site.js';
import { normalize } from './format.js';

/** Champs indispensables avant qu'un modèle puisse être vendu. */
export const SALE_FIELDS = [
  { key: 'name', label: 'nom commercial', ok: (p) => Boolean(p.name?.trim()) },
  { key: 'price', label: 'prix', ok: (p) => Number.isFinite(p.price) && p.price > 0 },
  { key: 'availability', label: 'disponibilité', ok: (p) => p.availability in AVAILABILITY },
  { key: 'images', label: 'photo', ok: (p) => p.images?.length > 0 },
];

/** Champs recommandés (signalés par npm run check, non bloquants). */
export const RECOMMENDED_FIELDS = [
  { key: 'shortDescription', label: 'description courte', ok: (p) => Boolean(p.shortDescription?.trim()) },
  { key: 'description', label: 'description détaillée', ok: (p) => Boolean(p.description?.trim()) },
];

export const missingForSale = (p) => SALE_FIELDS.filter((f) => !f.ok(p)).map((f) => f.label);

export const isPublished = (p) => p.status === 'published';
export const isOutOfStock = (p) => p.availability === 'out_of_stock' || (p.stock != null && p.stock <= 0);

/** Achetable : publié, complet, en stock. Un brouillon ne l'est jamais. */
export const isPurchasable = (p) => Boolean(p) && isPublished(p) && missingForSale(p).length === 0 && !isOutOfStock(p);

/** Visible sur la boutique : publié, ou brouillon si la boutique montre l'aperçu du catalogue. */
export const isVisible = (p, settings) => isPublished(p) || (p.status === 'draft' && settings.commerce.showDrafts);

export const maxQty = (p) => (p.stock == null ? 20 : Math.max(0, Math.min(20, p.stock)));

/** Nom affiché : le nom commercial, sinon la référence provisoire (jamais un nom inventé). */
export const displayName = (p) => p.name?.trim() || `Modèle ${p.reference}`;

/** État lisible pour les clients. */
export function saleState(p) {
  if (!isPublished(p)) return { id: 'soon', label: 'Bientôt disponible' };
  if (missingForSale(p).length) return { id: 'soon', label: 'Bientôt disponible' };
  if (isOutOfStock(p)) return { id: 'out', label: 'Épuisé' };
  return { id: 'ok', label: AVAILABILITY[p.availability] };
}

export const SORTS = [
  { id: '', label: 'Pertinence' },
  { id: 'recent', label: 'Nouveautés' },
  { id: 'prix-asc', label: 'Prix croissant' },
  { id: 'prix-desc', label: 'Prix décroissant' },
  { id: 'nom', label: 'Nom A–Z' },
];

/** Construit les accès rapides au catalogue (appelé une fois par jeu de données). */
export function buildCatalogue({ products, categories, collections, photos, settings }) {
  const photoById = new Map(photos.map((ph) => [ph.id, ph]));
  const visible = products.filter((p) => isVisible(p, settings));
  const byId = new Map(products.map((p) => [p.id, p]));
  const bySlug = new Map(visible.map((p) => [p.slug, p]));
  const catById = new Map(categories.map((c) => [c.id, c]));
  const visibleCollections = collections.filter((c) => c.status === 'published' || (c.status === 'draft' && settings.commerce.showDrafts));
  const haystack = new Map(visible.map((p) => [p.id, normalize([p.name, p.reference, p.shortDescription, ...(p.colors ?? []), catById.get(p.category)?.label].join(' '))]));

  const photosOf = (p) => (p.images ?? []).map((id) => photoById.get(id)).filter(Boolean);
  const unique = (list) => [...new Set(list)].filter(Boolean).sort((a, b) => a.localeCompare(b, 'fr'));

  /** Facettes disponibles : seulement les valeurs réellement renseignées. */
  const facets = {
    categories: categories.map((c) => ({ ...c, count: visible.filter((p) => p.category === c.id).length })),
    colors: unique(visible.flatMap((p) => p.colors ?? [])),
    availability: Object.entries(AVAILABILITY).filter(([id]) => visible.some((p) => isPublished(p) && p.availability === id)).map(([id, label]) => ({ id, label })),
    hasPrices: visible.some((p) => isPurchasable(p)),
  };

  function query({ q = '', category = '', color = '', availability = '', sort = '', collection = '' } = {}) {
    const words = normalize(q).split(/\s+/).filter(Boolean);
    const col = collection ? visibleCollections.find((c) => c.slug === collection) : null;
    let list = visible.filter((p) => {
      if (category && p.category !== category) return false;
      if (color && !(p.colors ?? []).includes(color)) return false;
      if (availability === 'achetable' && !isPurchasable(p)) return false;
      if (availability && availability !== 'achetable' && p.availability !== availability) return false;
      if (col && !col.products.includes(p.id)) return false;
      const h = haystack.get(p.id);
      return words.every((w) => h.includes(w));
    });
    const byRef = (a, b) => a.reference.localeCompare(b.reference, 'fr', { numeric: true });
    // Les modèles achetables passent devant les modèles en préparation.
    const base = (a, b) => Number(isPurchasable(b)) - Number(isPurchasable(a)) || Number(b.featured) - Number(a.featured) || byRef(a, b);
    const price = (p) => (isPurchasable(p) ? p.price : null);
    if (sort === 'recent') list = [...list].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '') || byRef(a, b));
    else if (sort === 'prix-asc' || sort === 'prix-desc') {
      const dir = sort === 'prix-asc' ? 1 : -1;
      list = [...list].sort((a, b) => (price(a) == null) - (price(b) == null) || dir * ((price(a) ?? 0) - (price(b) ?? 0)) || byRef(a, b));
    } else if (sort === 'nom') list = [...list].sort((a, b) => displayName(a).localeCompare(displayName(b), 'fr', { numeric: true }));
    else list = [...list].sort(base);
    return list;
  }

  const related = (p, n = 4) => {
    const same = visible.filter((x) => x.id !== p.id && (x.collections ?? []).some((c) => (p.collections ?? []).includes(c)));
    const cat = visible.filter((x) => x.id !== p.id && x.category === p.category && !same.includes(x));
    return [...same, ...cat].slice(0, n);
  };

  return {
    products: visible,
    collections: visibleCollections,
    categories,
    facets,
    query,
    related,
    photosOf,
    getPhoto: (id) => photoById.get(id),
    getProduct: (id) => byId.get(id),
    getProductBySlug: (slug) => bySlug.get(slug),
    getCategory: (id) => catById.get(id),
    getCollection: (slug) => visibleCollections.find((c) => c.slug === slug),
  };
}
