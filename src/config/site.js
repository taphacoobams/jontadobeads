// Constantes techniques. Les informations de la boutique (nom, contact, livraison, mentions)
// sont dans src/data/settings.json.

export const STORAGE_KEYS = {
  cart: 'jdb-panier',
  theme: 'jdb-theme',
};

export const PAGE_SIZE = { mobile: 12, desktop: 16 };

/** Disponibilités acceptées dans products.json. */
export const AVAILABILITY = {
  in_stock: 'Disponible',
  made_to_order: 'Sur commande',
  out_of_stock: 'Épuisé',
};

export const PRODUCT_STATUS = {
  draft: 'Brouillon',
  published: 'Publié',
  archived: 'Archivé',
};
