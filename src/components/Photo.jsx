/**
 * Photo du dossier « perles » (WebP en plusieurs largeurs, voir scripts/build-images.mjs).
 * `photo` est une entrée de src/data/photos.json.
 */
export default function Photo({ photo, alt = '', sizes = '(min-width: 64rem) 25vw, 50vw', eager = false, className }) {
  if (!photo) return <span className={`photo-missing ${className ?? ''}`} aria-hidden="true" />;
  const v = photo.variants;
  const fallback = v.find((x) => x.w >= 960) ?? v.at(-1);
  return (
    <img
      className={className}
      src={fallback.src}
      srcSet={v.map((x) => `${x.src} ${x.w}w`).join(', ')}
      sizes={sizes}
      width={fallback.w}
      height={fallback.h}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
    />
  );
}
