import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Modal from '../Modal.jsx';
import Logo from './Logo.jsx';
import { BeadRule } from '../ui.jsx';
import { NAV } from './Header.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import WhatsAppIcon from '../WhatsAppIcon.jsx';
import { contactLink } from '../../services/checkout.js';

export default function MobileMenu({ open, onClose }) {
  const { catalogue, settings } = useStore();
  const wa = contactLink(settings);
  const location = useLocation();
  // Ferme le menu à chaque navigation.
  useEffect(() => { onClose(); }, [location.key]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal open={open} onClose={onClose} variant="drawer" side="left" label="Menu" testId="menu">
      <div className="sheet menu">
        <div className="sheet__head"><Logo /></div>
        <nav aria-label="Menu mobile" className="sheet__body">
          <ul className="menu__main">
            <li><Link to="/">Accueil</Link></li>
            {NAV.map((n) => <li key={n.label}><Link to={n.to}>{n.label}</Link></li>)}
          </ul>
          <BeadRule />
          <p className="menu__heading">Catégories</p>
          <ul className="menu__sub">
            {catalogue.facets.categories.map((c) => (
              <li key={c.id}><Link to={`/boutique?categorie=${c.id}`}>{c.label}{c.count === 0 && <span className="menu__soon"> · bientôt</span>}</Link></li>
            ))}
          </ul>
        </nav>
        <div className="sheet__foot menu__foot">
          {wa && <a className="btn btn--block btn--whatsapp" href={wa} target="_blank" rel="noopener noreferrer"><WhatsAppIcon /> Écrire sur WhatsApp</a>}
          <Link to="/faq">Questions fréquentes</Link>
          <Link to="/livraison-retours">Livraison et retours</Link>
        </div>
      </div>
    </Modal>
  );
}
