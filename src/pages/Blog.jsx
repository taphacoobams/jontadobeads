import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import Photo from '../components/Photo.jsx';
import { Breadcrumbs, Eyebrow } from '../components/ui.jsx';
import { useStore } from '../context/StoreContext.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import NotFound from './NotFound.jsx';

/** Articles du blog (src/data/blog.json), du plus récent au plus ancien. */
export function usePosts() {
  const { data } = useStore();
  return [...(data.blog ?? [])].sort((a, b) => b.date.localeCompare(a.date));
}

const formatDate = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

export function PostCard({ post, headingLevel = 2 }) {
  const { catalogue } = useStore();
  const H = `h${headingLevel}`;
  return (
    <article className="post-card">
      <Link className="post-card__link" to={`/blog/${post.slug}`}>
        <span className="post-card__media"><Photo photo={catalogue.getPhoto(post.cover)} sizes="(min-width: 64rem) 30vw, (min-width: 48rem) 45vw, 90vw" /></span>
        <span className="post-card__meta">{post.tag} · {post.readingTime} min de lecture</span>
        <H className="post-card__title">{post.title}</H>
        <span className="post-card__excerpt">{post.excerpt}</span>
      </Link>
    </article>
  );
}

export function BlogIndex() {
  usePageMeta('Le journal', 'Culture des perles de taille au Sénégal, conseils pour choisir et entretenir ses bijoux, thiouraye et inspirations Jontado Beads.');
  const posts = usePosts();
  return (
    <section className="section section--page blog" aria-labelledby="blog-titre">
      <div className="container">
        <Breadcrumbs items={[{ to: '/', label: 'Accueil' }, { label: 'Blog' }]} />
        <div className="page-head">
          <Eyebrow>Le journal</Eyebrow>
          <h1 className="page-title" id="blog-titre">Blog</h1>
          <p className="section__intro">La baya et ses traditions, nos conseils pour bien choisir et entretenir vos bijoux, et l’univers des senteurs sénégalaises.</p>
        </div>
        <ul className="post-grid">
          {posts.map((p) => <li key={p.slug}><PostCard post={p} /></li>)}
        </ul>
      </div>
    </section>
  );
}

function Block({ b }) {
  if (b.type === 'h2') return <h2>{b.text}</h2>;
  if (b.type === 'ul') return <ul>{b.items.map((it) => <li key={it}>{it}</li>)}</ul>;
  if (b.type === 'tip') return <p className="post__tip">{b.text}</p>;
  return <p>{b.text}</p>;
}

export function BlogPost() {
  const { slug } = useParams();
  const { catalogue } = useStore();
  const posts = usePosts();
  const post = posts.find((p) => p.slug === slug);
  usePageMeta(post?.title ?? 'Article introuvable', post?.excerpt, { noindex: !post });
  if (!post) return <NotFound />;
  const others = posts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <article className="section section--page post" aria-labelledby="post-titre">
        <div className="container narrow">
          <Breadcrumbs items={[{ to: '/', label: 'Accueil' }, { to: '/blog', label: 'Blog' }, { label: post.title }]} />
          <Eyebrow>{post.tag}</Eyebrow>
          <h1 className="page-title" id="post-titre">{post.title}</h1>
          <p className="post__meta"><time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readingTime} min de lecture</p>
          <p className="lead">{post.excerpt}</p>
        </div>
        <div className="container post__cover-wrap">
          <Photo photo={catalogue.getPhoto(post.cover)} className="post__cover" sizes="(min-width: 64rem) 960px, 100vw" eager />
        </div>
        <div className="container narrow post__body">
          {post.body.map((b, i) => <Block key={i} b={b} />)}
          {post.links?.length > 0 && (
            <div className="post__links">
              {post.links.map((l) => <Link key={l.to} className="btn btn--ghost btn--small" to={l.to}>{l.label} <ArrowRight size={16} aria-hidden="true" /></Link>)}
            </div>
          )}
          {post.sources?.length > 0 && (
            <aside className="post__sources" aria-labelledby="sources-titre">
              <h2 id="sources-titre">Sources</h2>
              <ul>
                {post.sources.map((s) => (
                  <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title} <ExternalLink size={13} aria-hidden="true" /></a></li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </article>
      {others.length > 0 && (
        <section className="section section--tint" aria-labelledby="autres-titre">
          <div className="container">
            <h2 className="section__title section__title--small" id="autres-titre">À lire aussi</h2>
            <ul className="post-grid">
              {others.map((p) => <li key={p.slug}><PostCard post={p} headingLevel={3} /></li>)}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
