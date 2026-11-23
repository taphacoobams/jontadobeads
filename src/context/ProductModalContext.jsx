import { createContext, useContext, useMemo, useState } from 'react';

const ProductModalContext = createContext(null);

/** Fiche produit en fenêtre : identifiant du produit ouvert, ou null (comme Senemaille). */
export function ProductModalProvider({ children }) {
  const [id, setId] = useState(null);
  const value = useMemo(() => ({ id, openProduct: setId, closeProduct: () => setId(null) }), [id]);
  return <ProductModalContext.Provider value={value}>{children}</ProductModalContext.Provider>;
}

export const useProductModal = () => useContext(ProductModalContext);
