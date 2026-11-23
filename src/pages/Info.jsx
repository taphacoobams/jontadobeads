import { Link } from 'react-router-dom';
import { Breadcrumbs, EmptyState, Eyebrow } from '../components/ui.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { shopPhones } from '../services/checkout.js';
import { socialLinks } from '../lib/social.js';
import { PhoneList, SocialList } from '../components/ContactLinks.jsx';
import usePageMeta from '../hooks/usePageMeta.js';

function Page({ title, eyebrow, children, intro, id }) {
  return (
    <section className="section section--page" aria-labelledby={id}>
      <div className="container narrow">
        <Breadcrumbs items={[{ to: '/', label: 'Accueil' }, { label: title }]} />
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="page-title" id={id}>{title}</h1>
        {intro && <p className="lead">{intro}</p>}
        {children}
      </div>
    </section>
  );
}

export function Contact() {
  const { settings } = useStore();
  usePageMeta('Contact', `Contacter ${settings.shop.name}.`);
  const { contact } = settings;
  const phones = shopPhones(settings);
  const socials = socialLinks(contact);
  const channels = [
    phones.length > 0 && { label: phones.some((p) => p.wa) ? 'Téléphone et WhatsApp' : 'Téléphone', node: <PhoneList className="phone-list--large" /> },
    contact.email && { label: 'E-mail', value: contact.email, href: `mailto:${contact.email}` },
    socials.length > 0 && { label: 'Réseaux sociaux', node: <SocialList withHandle /> },
    contact.address && { label: 'Adresse', value: [contact.address, contact.city].filter(Boolean).join(', ') },
    contact.hours && { label: 'Horaires', value: contact.hours },
  ].filter(Boolean);

  return (
    <Page title="Contact" eyebrow="Nous écrire" id="contact-titre" intro="Une question sur un modèle, une commande ou une demande particulière ?">
      {channels.length ? (
        <ul className="channels">
          {channels.map((ch) => (
            <li key={ch.label}>
              <span className="channels__label">{ch.label}</span>
              {ch.node ?? (ch.href ? <a href={ch.href} {...(ch.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{ch.value}</a> : <span>{ch.value}</span>)}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="Nos coordonnées seront publiées très prochainement.">
          <p>En attendant, vous pouvez parcourir les modèles de la boutique.</p>
        </EmptyState>
      )}
    </Page>
  );
}

export function Faq() {
  const { content } = useStore();
  usePageMeta('Questions fréquentes');
  return (
    <Page title="Questions fréquentes" eyebrow="Aide" id="faq-titre">
      <div className="faq">
        {content.faq.map((it) => (
          <details key={it.q} className="faq__item">
            <summary>{it.q}</summary>
            <p>{it.a}</p>
          </details>
        ))}
      </div>
      <p className="faq__more">Vous ne trouvez pas votre réponse ? <Link to="/contact">Contactez-nous</Link>.</p>
    </Page>
  );
}
