import { useSearchParams } from 'react-router-dom';
import CatalogueView from '../components/CatalogueView.jsx';
import { Breadcrumbs, Eyebrow } from '../components/ui.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { isPurchasable } from '../lib/catalogue.js';
import usePageMeta from '../hooks/usePageMeta.js';

export default function Shop() {
  const { catalogue } = useStore();
  const [params] = useSearchParams();
  const cat = catalogue.getCategory(params.get('categorie'));
  const col = cat ? null : catalogue.getCollection(params.get('collection'));
  const head = cat ?? (col && { label: col.title, intro: col.intro });
  const title = head ? head.label : 'La boutique';
  usePageMeta(title, head?.intro ? head.intro : 'Toutes nos créations : bayas, chaînes de corps, bijoux de cuisse et de cheville, senteurs.');
  const preparing = !catalogue.products.some(isPurchasable);

  return (
    <section className="section section--page shop" aria-labelledby="boutique-titre">
      <div className="container">
        <Breadcrumbs items={[{ to: '/', label: 'Accueil' }, { to: '/boutique', label: 'Boutique' }, ...(head ? [{ label: head.label }] : [])]} />
        <div className="page-head">
          <Eyebrow>Boutique</Eyebrow>
          <h1 className="page-title" id="boutique-titre">{title}</h1>
          {head?.intro && <p className="section__intro">{head.intro}</p>}
        </div>
        {preparing && (
          <p className="notice" role="note">
            Notre catalogue est en cours de mise en ligne. Les modèles présentés ici recevront bientôt leur nom, leur prix et leur description ; la commande ouvrira à ce moment-là.
          </p>
        )}
        <CatalogueView />
      </div>
    </section>
  );
}
