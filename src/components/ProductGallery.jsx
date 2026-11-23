import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Photo from './Photo.jsx';

/**
 * Galerie de la fiche produit : grande photo, vignettes, flèches, glisser au doigt, flèches du
 * clavier. Une seule photo : ni vignettes ni flèches factices.
 */
export default function ProductGallery({ photos, name }) {
  const [index, setIndex] = useState(0);
  const start = useRef(null);
  const many = photos.length > 1;
  const current = photos[index];

  const go = (n) => { if (many) setIndex((n + photos.length) % photos.length); };
  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
  };
  const onDown = (e) => { start.current = e.clientX; };
  const onUp = (e) => {
    if (start.current == null) return;
    const dx = e.clientX - start.current;
    start.current = null;
    if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
  };

  if (!current) return <div className="gallery gallery--empty"><span className="photo-missing" /></div>;

  return (
    <div className="gallery" role="group" aria-roledescription="galerie" aria-label={`Photos de ${name}`} onKeyDown={onKey}>
      <div className="gallery__frame" onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => { start.current = null; }}>
        <Photo key={current.id} photo={current} eager alt={`${name}, photo ${index + 1} sur ${photos.length}`} sizes="(min-width: 64rem) 560px, 100vw" className="gallery__img" />
        {many && (
          <>
            <button type="button" className="icon-btn gallery__nav gallery__nav--prev" onClick={() => go(index - 1)} aria-label="Photo précédente"><ChevronLeft size={20} aria-hidden="true" /></button>
            <button type="button" className="icon-btn gallery__nav gallery__nav--next" onClick={() => go(index + 1)} aria-label="Photo suivante"><ChevronRight size={20} aria-hidden="true" /></button>
            <p className="gallery__count" aria-hidden="true">{index + 1} / {photos.length}</p>
          </>
        )}
      </div>
      {many && (
        <ul className="gallery__thumbs">
          {photos.map((ph, i) => (
            <li key={ph.id}>
              <button type="button" className={i === index ? 'is-active' : ''} onClick={() => setIndex(i)} aria-label={`Voir la photo ${i + 1}`} aria-current={i === index ? 'true' : undefined}>
                <Photo photo={ph} sizes="96px" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
