// Pages légales (même principe que Senemaille) : seules les informations vérifiables sont publiées
// (nom commercial, contact s'il est renseigné, fonctionnement réel du site). Tout le reste est omis.
// Les coordonnées et l'hébergeur viennent de src/data/settings.json : ils apparaissent dès qu'ils
// y sont renseignés.
import { Link, NavLink } from 'react-router-dom';
import { LEGAL_LINKS } from '../../components/layout/Footer.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import { formatDate } from '../../lib/format.js';
import { contactLink } from '../../services/checkout.js';
import usePageMeta from '../../hooks/usePageMeta.js';

function LegalPage({ title, description, children }) {
  const { settings } = useStore();
  usePageMeta(title, description);
  const updated = formatDate(settings.legal.updatedAt);
  return (
    <article className="section section--page legal">
      <div className="container legal__grid">
        <nav className="legal__nav" aria-label="Informations légales">
          <ul>{LEGAL_LINKS.map((l) => <li key={l.to}><NavLink to={l.to}>{l.label}</NavLink></li>)}</ul>
        </nav>
        <div className="legal__body">
          <h1 className="page-title">{title}</h1>
          {updated && <p className="legal__updated">Dernière mise à jour : {updated}</p>}
          <div className="legal__content">{children}</div>
        </div>
      </div>
    </article>
  );
}

/** Moyen de contact à citer : WhatsApp si renseigné, sinon la page Contact. */
function Reach() {
  const { settings } = useStore();
  const wa = contactLink(settings);
  if (wa) return <a href={wa} target="_blank" rel="noopener noreferrer">WhatsApp{settings.contact.phoneDisplay ? ` (${settings.contact.phoneDisplay})` : ''}</a>;
  if (settings.contact.email) return <a href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a>;
  return <Link to="/contact">la page Contact</Link>;
}

export function MentionsLegales() {
  const { settings } = useStore();
  const { name } = settings.shop;
  const c = settings.contact;
  const rows = [
    c.phoneDisplay && ['Téléphone', <a key="tel" href={`tel:${c.phoneDisplay.replace(/\s/g, '')}`}>{c.phoneDisplay}</a>],
    c.phoneSecondary && ['Autre numéro', <a key="tel2" href={`tel:${c.phoneSecondary.replace(/\s/g, '')}`}>{c.phoneSecondary}</a>],
    contactLink(settings) && ['WhatsApp', <Reach key="wa" />],
    c.email && ['E-mail', <a key="mail" href={`mailto:${c.email}`}>{c.email}</a>],
    (c.address || c.city) && ['Adresse', [c.address, c.city].filter(Boolean).join(', ')],
  ].filter(Boolean);
  return (
    <LegalPage title="Mentions légales" description={`Éditeur, contact et hébergement du site ${name}.`}>
      <h2>Éditeur du site</h2>
      <p>Le site est édité sous le nom commercial {name}, marque sénégalaise de bijoux et d’accessoires artisanaux.</p>
      {rows.length > 0 && (
        <>
          <h2>Contact</h2>
          <dl className="legal__dl">{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        </>
      )}
      {settings.legal.host && (
        <>
          <h2>Hébergement</h2>
          <p>Le site est hébergé par {settings.legal.host}.</p>
        </>
      )}
      <h2>Propriété intellectuelle</h2>
      <p>Les photographies des modèles et les textes du site appartiennent à {name}. Les logos Wave et Orange Money sont des marques de leurs titulaires respectifs ; ils sont affichés uniquement pour indiquer les moyens de paiement acceptés.</p>
    </LegalPage>
  );
}

export function Confidentialite() {
  const { settings } = useStore();
  const { name } = settings.shop;
  return (
    <LegalPage title="Politique de confidentialité" description={`Données utilisées lors d’une commande ${name}, transmission par WhatsApp et stockage dans votre navigateur.`}>
      <h2>En résumé</h2>
      <p>Le site ne dispose d’aucune base de données, d’aucun compte client et n’envoie aucune donnée à un serveur. Les informations que vous saisissez pour commander servent uniquement à rédiger le message WhatsApp que vous envoyez vous-même à {name}.</p>
      <h2>Données saisies lors d’une commande</h2>
      <ul>
        <li>Nom complet et numéro de téléphone.</li>
        <li>Ville, quartier et adresse détaillée ou indications pour vous trouver.</li>
        <li>Moyen de paiement choisi (Wave ou Orange Money) et contenu du panier.</li>
      </ul>
      <p>Aucune adresse e-mail n’est demandée. Ces informations restent dans la page le temps de la saisie : elles ne sont ni enregistrées dans votre navigateur ni transmises à un serveur du site.</p>
      <h2>Finalité</h2>
      <p>Permettre à {name} de traiter votre commande : confirmer la disponibilité, organiser la livraison et vous indiquer les modalités de paiement.</p>
      <h2>Transmission par WhatsApp</h2>
      <p>Lorsque vous confirmez, WhatsApp s’ouvre avec un message déjà rédigé. La commande n’est transmise que si vous envoyez ce message. L’échange se fait alors via WhatsApp, service soumis à sa propre politique de confidentialité.</p>
      <h2>Données enregistrées sur votre appareil</h2>
      <p>Pour votre confort, le site enregistre dans le stockage local de votre navigateur le contenu de votre panier. Il ne contient aucune donnée personnelle et reste sur cet appareil, dans ce navigateur, jusqu’à ce que vous le supprimiez (bouton « Vider le panier » ou effacement des données du site dans votre navigateur). Le site n’utilise ni cookie publicitaire ni outil de mesure d’audience.</p>
      <h2>Vos droits</h2>
      <p>Vous pouvez demander l’accès, la rectification ou la suppression des informations que vous avez transmises à {name} en écrivant via <Reach />. Au Sénégal, la protection des données à caractère personnel est encadrée par la loi n° 2008-12 du 25 janvier 2008 et la Commission de protection des données personnelles (CDP).</p>
    </LegalPage>
  );
}

export function ConditionsUtilisation() {
  const { settings } = useStore();
  const { name } = settings.shop;
  return (
    <LegalPage title="Conditions générales d’utilisation" description={`Fonctionnement du site ${name} : catalogue, panier et commande via WhatsApp.`}>
      <h2>Objet</h2>
      <p>Ces conditions décrivent l’utilisation du site {name}, qui présente un catalogue de bijoux et d’accessoires, et permet de préparer une commande transmise par WhatsApp.</p>
      <h2>Consultation du catalogue</h2>
      <p>La consultation est libre et gratuite, sans création de compte. Chaque modèle est présenté avec ses propres photographies. Les modèles marqués « Bientôt disponible » ne sont pas encore proposés à la vente.</p>
      <h2>Panier</h2>
      <p>Le panier est enregistré dans votre navigateur, sur l’appareil utilisé. Il n’est pas synchronisé entre appareils et ne vaut pas réservation : la disponibilité est confirmée par {name} après réception de votre message.</p>
      <h2>Commande via WhatsApp</h2>
      <p>Pour commander, vous renseignez vos coordonnées, votre adresse de livraison et le moyen de paiement souhaité, puis vous confirmez : WhatsApp s’ouvre avec un message déjà rédigé que vous envoyez vous-même. Aucun paiement n’est effectué sur le site.</p>
      <h2>Responsabilité</h2>
      <p>{name} veille à l’exactitude des informations publiées. Les liens vers des services tiers (WhatsApp) relèvent de leurs éditeurs.</p>
      <h2>Contact</h2>
      <p>Pour toute question : <Reach />.</p>
    </LegalPage>
  );
}

export function ConditionsVente() {
  const { settings } = useStore();
  const { name } = settings.shop;
  return (
    <LegalPage title="Conditions générales de vente" description={`Commande, confirmation, prix en FCFA, paiement Wave ou Orange Money et livraison chez ${name}.`}>
      <h2>Produits</h2>
      <p>Les produits sont ceux présentés dans la boutique avec leur prix. Seuls les modèles affichant un prix et un bouton « Ajouter au panier » peuvent être commandés.</p>
      <h2>Prix</h2>
      <p>Les prix sont indiqués en francs CFA (FCFA). Les frais de livraison ne sont pas inclus : ils dépendent de votre ville et vous sont indiqués par {name} sur WhatsApp.</p>
      <h2>Commande</h2>
      <ol>
        <li>Vous préparez votre panier et remplissez le formulaire de commande.</li>
        <li>Vous envoyez le message WhatsApp préparé par le site.</li>
        <li>{name} vous confirme la commande, la disponibilité et les modalités de livraison.</li>
      </ol>
      <h2>Paiement</h2>
      <p>Le paiement s’effectue par Wave ou Orange Money, après la confirmation de la commande par {name}, qui vous transmet les instructions. Le site ne collecte aucune donnée bancaire et n’effectue aucun paiement.</p>
      <h2>Livraison</h2>
      <p>{settings.delivery.text}</p>
      <h2>Questions sur une commande</h2>
      <p>Pour toute question sur une commande en cours, une modification ou une réclamation, écrivez via <Reach />.</p>
    </LegalPage>
  );
}

export function LivraisonRetours() {
  const { settings } = useStore();
  const { name } = settings.shop;
  return (
    <LegalPage title="Livraison et retours" description={`Comment ${name} organise la livraison de vos commandes et répond à vos questions après achat.`}>
      <h2>Livraison</h2>
      <p>{settings.delivery.text}</p>
      <ul>
        <li>Le formulaire de commande vous demande votre ville, votre quartier et une adresse détaillée ou des indications pour vous trouver.</li>
        <li>Les frais de livraison sont indiqués par {name} sur WhatsApp ; le site ne les ajoute jamais automatiquement.</li>
      </ul>
      {settings.returns.policy && (
        <>
          <h2>Retours et échanges</h2>
          <p>{settings.returns.policy}</p>
        </>
      )}
      <h2>Après réception</h2>
      <p>Pour toute question sur un article reçu, écrivez à {name} via <Reach />.</p>
    </LegalPage>
  );
}
