import { useEffect } from 'react';
import { useStore } from '../context/StoreContext.jsx';

const DEFAULT_DESCRIPTION = "Jontado Beads, marque sénégalaise de création artisanale de bijoux et d'accessoires : perles de taille, chaînes de corps, bijoux de cuisse et de cheville, senteurs. Commande sur WhatsApp, paiement Wave ou Orange Money.";

/** Titre, description et indexation de la page (React Router ne les gère pas). */
export default function usePageMeta(title, description = DEFAULT_DESCRIPTION, { noindex = false } = {}) {
  const { settings } = useStore();
  const name = settings.shop.name;
  useEffect(() => {
    document.title = title ? `${title} | ${name}` : `${name} | Bayas et perles`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    let robots = document.querySelector('meta[name="robots"]');
    if (noindex) {
      if (!robots) {
        robots = document.createElement('meta');
        robots.name = 'robots';
        document.head.append(robots);
      }
      robots.content = 'noindex, nofollow';
    } else robots?.remove();
  }, [title, description, name, noindex]);
}
