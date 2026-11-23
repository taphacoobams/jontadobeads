const cache = new Map();

/** 12500 -> « 12 500 FCFA ». Renvoie null si le montant n'est pas renseigné. */
export function money(amount, commerce = { locale: 'fr-SN', currencyLabel: 'FCFA' }) {
  if (amount == null || Number.isNaN(Number(amount))) return null;
  const key = commerce.locale || 'fr-FR';
  if (!cache.has(key)) cache.set(key, new Intl.NumberFormat(key, { maximumFractionDigits: 0 }));
  return `${cache.get(key).format(amount)} ${commerce.currencyLabel}`;
}

/** Minuscules, sans accents : pour la recherche. */
export const normalize = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;

export const slugify = (s) => normalize(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const formatDate = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};
