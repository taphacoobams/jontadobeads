import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { BeadRule } from '../ui.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import { shopPhones } from '../../services/checkout.js';
import PaymentLogos from '../PaymentLogos.jsx';
import { socialLinks } from '../../lib/social.js';
import { PhoneList, SocialList } from '../ContactLinks.jsx';

export const LEGAL_LINKS = [
  { to: '/mentions-legales', label: 'Mentions légales' },
  { to: '/confidentialite', label: 'Politique de confidentialité' },
  { to: '/conditions-utilisation', label: 'Conditions d’utilisation' },
  { to: '/conditions-vente', label: 'Conditions générales de vente' },
  { to: '/livraison-retours', label: 'Livraison et retours' },
];

/** Catégories mises en avant dans le pied de page (hors styles de bayas, accessibles depuis la boutique). */
const FOOTER_CATEGORIES = ['chaines', 'cuisse-cheville', 'parfums'];

export default function Footer() {
  const { settings, catalogue } = useStore();
  const { contact, shop } = settings;
  const phones = shopPhones(settings);
  const socials = socialLinks(contact);
  const collections = catalogue.collections.filter((c) => c.status === 'published');
  const categories = FOOTER_CATEGORIES.map((id) => catalogue.getCategory(id)).filter(Boolean);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__main">
          <div className="site-footer__brand">
            <Link className="brand brand--footer" to="/"><Logo variant="complet" /><span className="visually-hidden"> (accueil)</span></Link>
            {shop.tagline && <p className="site-footer__tagline">{shop.tagline}</p>}
            <p className="site-footer__pitch">Bijoux et accessoires artisanaux, confectionnés avec soin au Sénégal.</p>
            <BeadRule className="bead-rule--light" />
          </div>

          <nav className="site-footer__col" aria-labelledby="f-boutique">
            <h2 className="site-footer__heading" id="f-boutique">Boutique</h2>
            <ul>
              <li><Link to="/boutique">Toute la boutique</Link></li>
              {collections.map((c) => <li key={c.slug}><Link to={`/boutique?collection=${c.slug}`}>{c.title}</Link></li>)}
              {categories.map((c) => <li key={c.id}><Link to={`/boutique?categorie=${c.id}`}>{c.label}</Link></li>)}
            </ul>
          </nav>

          <nav className="site-footer__col" aria-labelledby="f-aide">
            <h2 className="site-footer__heading" id="f-aide">Aide</h2>
            <ul>
              <li><Link to="/blog">Le blog</Link></li>
              <li><Link to="/faq">Questions fréquentes</Link></li>
              <li><Link to="/livraison-retours">Livraison et retours</Link></li>
              <li><Link to="/conditions-vente">Conditions de vente</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </nav>

          <div className="site-footer__col site-footer__contact">
            <h2 className="site-footer__heading">Nous joindre</h2>
            {phones.length || contact.email || socials.length ? (
              <>
                <PhoneList />
                {contact.email && <p className="site-footer__email"><a href={`mailto:${contact.email}`}>{contact.email}</a></p>}
                <SocialList className="site-footer__social" />
              </>
            ) : (
              <p className="site-footer__note">Nos coordonnées seront publiées très prochainement.</p>
            )}
            <h2 className="site-footer__heading site-footer__heading--sub">Paiement</h2>
            <PaymentLogos />
          </div>
        </div>

        <div className="site-footer__legal">
          <ul>{LEGAL_LINKS.map((l) => <li key={l.to}><Link to={l.to}>{l.label}</Link></li>)}</ul>
          <p>© {new Date().getFullYear()} {shop.name} · Réalisé par <a href="https://hypetechdigital.vercel.app/" target="_blank" rel="noopener">Hypetech Digital</a></p>
        </div>
      </div>
    </footer>
  );
}
