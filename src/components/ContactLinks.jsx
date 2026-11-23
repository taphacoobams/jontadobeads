import { Phone } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon.jsx';
import SocialIcon from './SocialIcon.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { shopPhones } from '../services/checkout.js';
import { socialLinks } from '../lib/social.js';

const ext = { target: '_blank', rel: 'noopener noreferrer' };

/** Numéros de la boutique : appeler ou écrire sur WhatsApp, pour chacun. */
export function PhoneList({ className = '' }) {
  const { settings } = useStore();
  const phones = shopPhones(settings);
  if (!phones.length) return null;
  return (
    <ul className={`phone-list ${className}`}>
      {phones.map((p) => (
        <li key={p.display} className="phone-list__item">
          <span className="phone-list__number">{p.display}</span>
          <span className="phone-list__actions">
            <a className="contact-action" href={p.tel}><Phone size={16} strokeWidth={1.75} aria-hidden="true" /> Appeler<span className="visually-hidden"> le {p.display}</span></a>
            {p.wa && <a className="contact-action contact-action--wa" href={p.wa} {...ext}><WhatsAppIcon size={16} /> WhatsApp<span className="visually-hidden"> au {p.display}</span></a>}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Réseaux sociaux : logos cliquables (avec l'identifiant en texte si `withHandle`). */
export function SocialList({ withHandle = false, className = '' }) {
  const { settings } = useStore();
  const socials = socialLinks(settings.contact);
  if (!socials.length) return null;
  return (
    <ul className={`social-list ${withHandle ? 'social-list--handles' : ''} ${className}`} aria-label="Réseaux sociaux">
      {socials.map((s) => (
        <li key={s.id}>
          <a className="social-list__link" href={s.href} {...ext} aria-label={withHandle ? undefined : `${s.label} (${s.handle})`} title={withHandle ? undefined : s.label}>
            <SocialIcon network={s.id} size={withHandle ? 20 : 18} />
            {withHandle && <span><span className="social-list__name">{s.label}</span> {s.handle}</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}
