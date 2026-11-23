import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from './ProductCard.jsx';
import Modal from './Modal.jsx';
import { EmptyState } from './ui.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { SORTS } from '../lib/catalogue.js';
import { plural } from '../lib/format.js';
import { PAGE_SIZE } from '../config/site.js';
import useMediaQuery from '../hooks/useMediaQuery.js';

/**
 * Grille de produits avec recherche, filtres, tri et chargement progressif.
 * L'état est dans l'adresse (?categorie=cristal&tri=prix-asc…) : partageable et conservé au retour.
 */
export default function CatalogueView() {
  const { catalogue } = useStore();
  const [params, setParams] = useSearchParams();
  const desktop = useMediaQuery('(min-width: 64rem)');
  const pageSize = desktop ? PAGE_SIZE.desktop : PAGE_SIZE.mobile;
  const searchRef = useRef(null);
  const [q, setQ] = useState(params.get('q') ?? '');
  const [shown, setShown] = useState(pageSize);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { facets } = catalogue;
  const validCat = facets.categories.some((c) => c.id === params.get('categorie'));
  const f = {
    collection: catalogue.collections.some((c) => c.slug === params.get('collection')) ? params.get('collection') : '',
    category: validCat ? params.get('categorie') : '',
    color: facets.colors.includes(params.get('couleur')) ? params.get('couleur') : '',
    availability: ['achetable', ...facets.availability.map((a) => a.id)].includes(params.get('dispo')) ? params.get('dispo') : '',
    sort: SORTS.some((s) => s.id === params.get('tri')) ? params.get('tri') : '',
    q: params.get('q') ?? '',
  };

  const update = (patch) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('recherche');
      Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
      return next;
    }, { replace: true });
    setShown(pageSize);
  };

  // Recherche instantanée (légère temporisation).
  useEffect(() => {
    const t = setTimeout(() => { if (q.trim() !== f.q) update({ q: q.trim() }); }, 200);
    return () => clearTimeout(t);
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  // Loupe de l'en-tête : /boutique?recherche=1 place le curseur dans la recherche.
  useEffect(() => { if (params.get('recherche')) searchRef.current?.focus(); }, [params]);

  const list = useMemo(() => catalogue.query(f), [catalogue, f.q, f.collection, f.category, f.color, f.availability, f.sort]); // eslint-disable-line react-hooks/exhaustive-deps
  const visible = list.slice(0, shown);
  const rest = list.length - visible.length;
  const activeCount = [f.collection, f.color, f.availability, f.category].filter(Boolean).length;
  // Recherche ou filtre restrictif : sinon, une catégorie vide est simplement « à venir ».
  const narrowing = Boolean(f.q || f.color || f.availability || f.collection);
  const reset = () => { setQ(''); setParams(new URLSearchParams(), { replace: true }); };

  const filters = <Filters f={f} facets={facets} collections={catalogue.collections} update={update} />;

  return (
    <div className="catalogue">
      <div className="catalogue__bar">
        <div className="search-box">
          <label className="visually-hidden" htmlFor="recherche">Rechercher un modèle</label>
          <Search size={18} aria-hidden="true" className="search-box__icon" />
          <input
            ref={searchRef}
            id="recherche"
            type="search"
            placeholder="Rechercher (nom, référence, couleur)"
            autoComplete="off"
            enterKeyHint="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q && <button type="button" className="icon-btn search-box__clear" onClick={() => { setQ(''); searchRef.current?.focus(); }} aria-label="Effacer la recherche"><X size={16} aria-hidden="true" /></button>}
        </div>
        <div className="field field--inline">
          <label htmlFor="tri">Trier</label>
          <select id="tri" value={f.sort} onChange={(e) => update({ tri: e.target.value })}>
            {SORTS.filter((s) => facets.hasPrices || !s.id.startsWith('prix')).map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        {!desktop && (
          <button type="button" className="btn btn--ghost btn--small filters-btn" onClick={() => setFiltersOpen(true)} aria-haspopup="dialog">
            <SlidersHorizontal size={16} aria-hidden="true" /> Filtres{activeCount ? ` (${activeCount})` : ''}
          </button>
        )}
      </div>

      <div className="catalogue__layout">
        {desktop && <aside className="catalogue__aside" aria-label="Filtres">{filters}</aside>}
        <div className="catalogue__results">
          <p className="catalogue__count" aria-live="polite" data-testid="result-count">
            {list.length ? plural(list.length, 'modèle', 'modèles') : 'Aucun modèle'}
          </p>
          {list.length > 0 ? (
            <ul className="grid">
              {visible.map((p, i) => <li key={p.id}><ProductCard product={p} eager={i < 2} /></li>)}
            </ul>
          ) : (
            <EmptyState
              title={narrowing ? 'Aucun modèle ne correspond à votre recherche.' : 'Cette sélection arrive bientôt.'}
              action={narrowing && <button type="button" className="btn btn--ghost" onClick={reset}>Effacer les filtres</button>}
            >
              {!narrowing && <p>Les modèles de cette sélection seront publiés prochainement.</p>}
            </EmptyState>
          )}
          {rest > 0 && (
            <div className="catalogue__more">
              <p>{visible.length} sur {list.length}</p>
              <button type="button" className="btn btn--ghost" onClick={() => setShown((s) => s + pageSize)}>Afficher plus de modèles</button>
            </div>
          )}
        </div>
      </div>

      {!desktop && (
        <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} label="Filtres" variant="drawer" side="bottom" testId="filters">
          <div className="sheet">
            <div className="sheet__head"><p className="sheet__title">Filtres</p></div>
            <div className="sheet__body">{filters}</div>
            <div className="sheet__foot">
              <button type="button" className="btn btn--block" onClick={() => setFiltersOpen(false)}>Voir {plural(list.length, 'modèle', 'modèles')}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/** Groupes de filtres : un groupe n'apparaît que si ses valeurs sont renseignées dans le catalogue. */
function Filters({ f, facets, collections, update }) {
  return (
    <div className="filters">
      <fieldset className="filters__group">
        <legend>Catégorie</legend>
        <Choice name="categorie" value="" current={f.category} onPick={update} label="Toutes" />
        {facets.categories.map((c) => <Choice key={c.id} name="categorie" value={c.id} current={f.category} onPick={update} label={c.label} count={c.count} />)}
      </fieldset>
      {collections.length > 0 && (
        <fieldset className="filters__group">
          <legend>Collection</legend>
          <Choice name="collection" value="" current={f.collection} onPick={update} label="Toutes" />
          {collections.map((c) => <Choice key={c.slug} name="collection" value={c.slug} current={f.collection} onPick={update} label={c.title} count={c.products.length} />)}
        </fieldset>
      )}
      <fieldset className="filters__group">
        <legend>Disponibilité</legend>
        <Choice name="dispo" value="" current={f.availability} onPick={update} label="Tous les modèles" />
        <Choice name="dispo" value="achetable" current={f.availability} onPick={update} label="Disponibles à l'achat" />
        {facets.availability.map((a) => <Choice key={a.id} name="dispo" value={a.id} current={f.availability} onPick={update} label={a.label} />)}
      </fieldset>
      {facets.colors.length > 0 && (
        <fieldset className="filters__group">
          <legend>Couleur</legend>
          <Choice name="couleur" value="" current={f.color} onPick={update} label="Toutes" />
          {facets.colors.map((c) => <Choice key={c} name="couleur" value={c} current={f.color} onPick={update} label={c} />)}
        </fieldset>
      )}
    </div>
  );
}

function Choice({ name, value, current, onPick, label, count }) {
  const id = `${name}-${value || 'tous'}`;
  return (
    <label className="choice" htmlFor={id}>
      <input type="radio" id={id} name={name} checked={current === value} onChange={() => onPick({ [name]: value })} />
      <span>{label}</span>
      {count != null && <span className="choice__count">{count}</span>}
    </label>
  );
}

