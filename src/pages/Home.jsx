import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Photo from '../components/Photo.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { Reveal, BeadRule, Eyebrow } from '../components/ui.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { isPurchasable } from '../lib/catalogue.js';
import usePageMeta from '../hooks/usePageMeta.js';
import { PostCard, usePosts } from './Blog.jsx';

export default function Home() {
  usePageMeta(null);
  return (
    <>
      <Hero />
      <Universe />
      <Categories />
      <Selection />
      <Craft />
      <Collections />
      <Journal />
      <Promises />
    </>
  );
}

function Hero() {
  const { content, catalogue } = useStore();
  const h = content.home.hero;
  const photos = h.photos.map(catalogue.getPhoto).filter(Boolean);
  return (
    <section className="hero" aria-labelledby="hero-titre">
      <div className="container hero__grid">
        <div className="hero__text">
          <Eyebrow>{h.eyebrow}</Eyebrow>
          <h1 className="hero__title" id="hero-titre">{h.title}</h1>
          <p className="hero__lede">{h.lede}</p>
          <div className="hero__actions">
            <Link className="btn" to="/boutique">Découvrir la boutique</Link>
            <a className="btn btn--ghost" href="#styles">Nos univers</a>
          </div>
        </div>
        <div className="hero__media" aria-hidden="true">
          {photos.map((ph, i) => (
            <span key={ph.id} className={`hero__photo hero__photo--${i}`}>
              <Photo photo={ph} eager={i === 0} sizes={i === 0 ? '(min-width: 64rem) 34vw, 70vw' : '(min-width: 64rem) 18vw, 36vw'} />
            </span>
          ))}
          <BeadRule className="hero__rule" />
        </div>
      </div>
    </section>
  );
}

function Universe() {
  const { content, catalogue } = useStore();
  const u = content.home.universe;
  return (
    <section className="section universe" aria-labelledby="univers-titre">
      <div className="container universe__grid">
        <Reveal className="universe__photo">
          <Photo photo={catalogue.getPhoto(u.photo)} sizes="(min-width: 64rem) 40vw, 100vw" />
        </Reveal>
        <Reveal className="universe__text" delay={120}>
          <Eyebrow>{u.eyebrow}</Eyebrow>
          <h2 className="section__title" id="univers-titre">{u.title}</h2>
          <p className="lead">{u.text}</p>
          <Link className="text-link" to="/boutique">Voir toutes les créations <ArrowRight size={16} aria-hidden="true" /></Link>
        </Reveal>
      </div>
    </section>
  );
}

function Categories() {
  const { catalogue } = useStore();
  const cats = catalogue.facets.categories;
  return (
    <section className="section section--tint categories" id="styles" aria-labelledby="cat-titre">
      <div className="container">
        <div className="section__head">
          <Eyebrow>Nos univers</Eyebrow>
          <h2 className="section__title" id="cat-titre">Bayas, chaînes et senteurs</h2>
        </div>
        <ul className="cat-grid">
          {cats.map((c, i) => {
            const cover = c.cover ? catalogue.getPhoto(c.cover) : null;
            return (
              <Reveal as="li" key={c.id} delay={i * 80} className={`cat-tile${cover ? '' : ' cat-tile--soon'}`}>
                <Link to={`/boutique?categorie=${c.id}`}>
                  <span className="cat-tile__media">{cover ? <Photo photo={cover} sizes="(min-width: 64rem) 30vw, 90vw" /> : <BeadRule />}</span>
                  <span className="cat-tile__body">
                    <span className="cat-tile__name">{c.label}</span>
                    <span className="cat-tile__intro">{c.intro}</span>
                    <span className="cat-tile__count">{c.count > 1 ? `${c.count} modèles` : c.count === 1 ? '1 modèle' : 'Bientôt'}</span>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** Sélection : modèles mis en avant (featured) et achetables d'abord, puis aperçu du catalogue. */
function Selection() {
  const { catalogue } = useStore();
  const bayas = catalogue.query({});
  const featured = bayas.filter((p) => p.featured);
  const list = (featured.length >= 4 ? featured : [...featured, ...bayas.filter((p) => !p.featured)]).slice(0, 8);
  const ready = list.some(isPurchasable);
  if (!list.length) return null;
  return (
    <section className="section selection" aria-labelledby="sel-titre">
      <div className="container">
        <div className="section__head section__head--row">
          <div>
            <Eyebrow>{ready ? 'Sélection' : 'Aperçu du catalogue'}</Eyebrow>
            <h2 className="section__title" id="sel-titre">Nos créations</h2>
            {!ready && <p className="section__intro">Les modèles arrivent en boutique : noms, prix et disponibilités seront publiés très prochainement.</p>}
          </div>
          <Link className="btn btn--ghost" to="/boutique">Tout voir</Link>
        </div>
        <ul className="grid">
          {list.map((p) => <li key={p.id}><ProductCard product={p} /></li>)}
        </ul>
      </div>
    </section>
  );
}

function Craft() {
  const { content, catalogue } = useStore();
  const c = content.home.craft;
  const photos = c.photos.map(catalogue.getPhoto).filter(Boolean);
  return (
    <section className="section section--dark craft" aria-labelledby="craft-titre">
      <div className="container craft__grid">
        <Reveal className="craft__text">
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <h2 className="section__title" id="craft-titre">{c.title}</h2>
          <p className="lead">{c.text}</p>
        </Reveal>
        <ul className="craft__photos">
          {photos.map((ph, i) => (
            <Reveal as="li" key={ph.id} delay={i * 100}><Photo photo={ph} sizes="(min-width: 64rem) 20vw, 33vw" /></Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Colonnes de la grille des collections : jamais une tuile seule sous une rangée pleine (3 → 3, 4 → 2 × 2, 5 → 3 + 2 centrées). */
const colsFor = (n) => (n <= 3 ? n : n % 3 === 0 ? 3 : n % 2 === 0 ? 2 : 3);

function Collections() {
  const { catalogue } = useStore();
  const cols = catalogue.collections;
  if (!cols.length) return null;
  return (
    <section className="section collections-band" aria-labelledby="col-titre">
      <div className="container">
        <div className="section__head">
          <Eyebrow>Collections</Eyebrow>
          <h2 className="section__title" id="col-titre">Des séries qui se répondent</h2>
        </div>
        <ul className="col-grid" style={{ '--cols': colsFor(cols.length) }}>
          {cols.map((c) => <li key={c.id}><CollectionTile collection={c} /></li>)}
        </ul>
      </div>
    </section>
  );
}

function CollectionTile({ collection: c }) {
  const { catalogue } = useStore();
  const pics = c.products.map(catalogue.getProduct).filter(Boolean).map((p) => catalogue.photosOf(p)[0]).filter(Boolean).slice(0, 3);
  const cover = catalogue.getPhoto(c.cover) ?? pics[0];
  return (
    <Link className="col-tile" to={`/boutique?collection=${c.slug}`}>
      <span className="col-tile__media">
        <Photo photo={cover} sizes="(min-width: 64rem) 40vw, 90vw" />
        {c.status === 'draft' && <span className="card__tag card__tag--soon">En préparation</span>}
      </span>
      <span className="col-tile__body">
        <span className="col-tile__title">Collection {c.title}</span>
        <span className="col-tile__count">{c.products.length} modèles</span>
      </span>
    </Link>
  );
}

function Journal() {
  const posts = usePosts().slice(0, 3);
  if (!posts.length) return null;
  return (
    <section className="section journal" aria-labelledby="journal-titre">
      <div className="container">
        <div className="section__head section__head--row">
          <div>
            <Eyebrow>Le journal</Eyebrow>
            <h2 className="section__title" id="journal-titre">Autour de la baya</h2>
          </div>
          <Link className="text-link" to="/blog">Tous les articles <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        <ul className="post-grid">
          {posts.map((p) => <li key={p.slug}><PostCard post={p} headingLevel={3} /></li>)}
        </ul>
      </div>
    </section>
  );
}

function Promises() {
  const { content } = useStore();
  const items = content.home.promises;
  if (!items?.length) return null;
  return (
    <section className="section section--tint promises" aria-label="Nos engagements">
      <div className="container">
        <ul className="promises__list">
          {items.map((it, i) => (
            <Reveal as="li" key={it.title} delay={i * 80}>
              <span className="promises__index" aria-hidden="true">0{i + 1}</span>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
