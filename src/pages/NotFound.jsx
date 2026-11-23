import { Link } from 'react-router-dom';
import { BeadRule } from '../components/ui.jsx';
import usePageMeta from '../hooks/usePageMeta.js';

export default function NotFound() {
  usePageMeta('Page introuvable', undefined, { noindex: true });
  return (
    <section className="section section--page not-found" aria-labelledby="nf-titre">
      <div className="container narrow">
        <p className="not-found__code" aria-hidden="true">404</p>
        <h1 className="page-title" id="nf-titre">Cette page s'est détachée du fil.</h1>
        <p className="lead">L'adresse demandée n'existe pas ou n'est plus disponible.</p>
        <BeadRule />
        <div className="form__actions">
          <Link className="btn" to="/boutique">Voir la boutique</Link>
          <Link className="btn btn--ghost" to="/">Accueil</Link>
        </div>
      </div>
    </section>
  );
}
