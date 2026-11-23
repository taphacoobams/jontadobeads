// Petits composants d'interface partagés.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';

/** Apparition douce au défilement (une seule fois). Contenu visible sans JavaScript ni animation. */
export function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setShown(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal${shown ? ' is-shown' : ''} ${className}`} style={delay ? { '--reveal-delay': `${delay}ms` } : undefined} {...rest}>
      {children}
    </Tag>
  );
}

/** Rang de perles : séparateur décoratif, signature graphique de la marque. */
export function BeadRule({ className = '' }) {
  const beads = [3, 2.2, 2.2, 4.5, 2.2, 2.2, 3];
  let x = 0;
  return (
    <svg className={`bead-rule ${className}`} viewBox="0 0 120 12" aria-hidden="true" focusable="false">
      <line x1="0" y1="6" x2="120" y2="6" />
      {beads.map((r, i) => {
        x += i === 0 ? 38 : beads[i - 1] + r + 3;
        return <circle key={i} cx={x} cy="6" r={r} className={r > 4 ? 'bead-rule__main' : undefined} />;
      })}
    </svg>
  );
}

export function Eyebrow({ children }) {
  return <p className="eyebrow">{children}</p>;
}

export function Breadcrumbs({ items }) {
  return (
    <nav className="crumbs" aria-label="Fil d'Ariane">
      <ol>
        {items.map((it, i) => (
          <li key={it.label}>
            {it.to && i < items.length - 1 ? <Link to={it.to}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function QuantityStepper({ value, onChange, min = 1, max = 20, label, small = false }) {
  return (
    <div className={`stepper${small ? ' stepper--small' : ''}`} role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Diminuer la quantité"><Minus size={16} aria-hidden="true" /></button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Augmenter la quantité"><Plus size={16} aria-hidden="true" /></button>
    </div>
  );
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="empty">
      <BeadRule />
      <p className="empty__title">{title}</p>
      {children && <div className="empty__text">{children}</div>}
      {action}
    </div>
  );
}

/** Champ de formulaire avec libellé, aide et erreur reliés pour les lecteurs d'écran. */
export function Field({ id, label, required = false, optional = false, error, help, as = 'input', children, ...props }) {
  const Tag = as;
  const describedBy = [help && `${id}-aide`, error && `${id}-erreur`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {required && <span className="field__req" aria-hidden="true"> *</span>}
        {optional && <span className="field__opt"> (facultatif)</span>}
      </label>
      {children ?? <Tag id={id} name={id} aria-invalid={error ? 'true' : undefined} aria-required={required || undefined} aria-describedby={describedBy} {...props} />}
      {help && <p className="field__help" id={`${id}-aide`}>{help}</p>}
      {error && <p className="field__error" id={`${id}-erreur`}>{error}</p>}
    </div>
  );
}

