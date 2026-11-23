import { createContext, useContext } from 'react';
import { loadPublished } from '../services/dataSource.js';
import { buildCatalogue } from '../lib/catalogue.js';

const data = loadPublished();
const value = { data, settings: data.settings, content: data.content, catalogue: buildCatalogue(data) };
const StoreContext = createContext(value);

/** Données de la boutique et catalogue calculé (une seule fois, les données sont fixes). */
export function StoreProvider({ children }) {
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
