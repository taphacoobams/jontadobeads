# Architecture

## Vue d'ensemble

Application React monopage, compilée par Webpack, servie en statique (Netlify). Pas de serveur : les données sont des fichiers JSON intégrés au build. Les commandes sont transmises à la boutique par WhatsApp.

```
jontadobeads/
├── perles /                  Photos originales (jamais modifiées par le code)
├── scripts/
│   ├── photo-curation.json   Curation manuelle : statut, modèle, rôle, observation
│   ├── build-images.mjs      perles → public/images/perles/*.webp + src/data/photos.json + docs/PHOTO_INVENTORY.md
│   └── check-catalogue.mjs   Contrôle de cohérence des données (npm run check)
├── public/                   Copié tel quel (images WebP, favicon, robots.txt, _redirects)
├── src/
│   ├── main.jsx, App.jsx     Entrée et routes
│   ├── config/site.js        Constantes techniques (clés de stockage, statuts, disponibilités)
│   ├── data/                 ⭐ Données : products, categories, collections, settings, content, photos
│   ├── services/
│   │   ├── dataSource.js     Chargement des données (point de bascule vers une API)
│   │   └── checkout.js       Message WhatsApp de commande et liens de contact
│   ├── lib/                  Fonctions pures : catalogue (règles de vente, recherche, facettes), panier, validation, format
│   ├── context/              StoreContext (données), CartContext (panier, panneau, commande), ProductModalContext (fiche)
│   ├── payment/              Wave et Orange Money (logos dans public/images/payment)
│   ├── hooks/                usePageMeta, useMediaQuery
│   ├── components/           layout/, checkout/CheckoutModal, ProductModal, CartDrawer, CatalogueView, ProductCard, ProductGallery, PaymentLogos, Modal, ui.jsx
│   ├── pages/                Accueil, boutique, collections, contact, FAQ, légal (5), 404
│   └── styles/               tokens.css, base.css, main.css, commerce.css
└── tests/                    make-fixtures.mjs (données d'essai) + e2e/ (Playwright + axe-core)
```

## Séparation des responsabilités

| Couche | Contient | Ne contient pas |
| --- | --- | --- |
| `data/products.json` | Informations produit (nom, prix, textes, variantes, stock, statut, photos par identifiant) | Chemins d'images, mise en page |
| `data/photos.json` | Fichiers WebP générés et leurs dimensions | Informations commerciales |
| `data/categories.json`, `collections.json` | Familles et séries | Produits (référencés par identifiant) |
| `data/settings.json` | Boutique, contact, vente, livraison, paiement, retours, mentions légales | Textes éditoriaux |
| `data/content.json` | Textes de l'accueil, À propos, FAQ | Données commerciales |
| `lib/catalogue.js` | Règles : `isPurchasable`, `missingForSale`, `saleState`, recherche, facettes | Accès aux données |
| Composants | Affichage | Données codées en dur |

## Modèle produit

```json
{
  "id": "BAYA-001", "reference": "BAYA-001", "slug": "baya-001",
  "status": "draft",                 // draft | published | archived
  "name": null, "category": "bayas", "categoryConfirmed": false, "collections": [],
  "shortDescription": null, "description": null,
  "price": null, "compareAtPrice": null,
  "images": ["baya-001-1"],          // la première est la photo principale
  "variants": [],                    // [{ id, label, price|null, stock|null }]
  "colors": [], "sizes": [],
  "availability": null,              // in_stock | made_to_order | out_of_stock
  "stock": null,                     // null = non suivi
  "featured": false, "internalNote": "…",
  "createdAt": "2026-11-22", "updatedAt": "2026-11-22"
}
```

**Règle de vente** (`isPurchasable`) : statut `published` + nom + prix > 0 + disponibilité + au moins une photo + pas épuisé. Un brouillon n'est jamais achetable : pas de bouton d'ajout, pas de prix, mention « Bientôt disponible ». `npm run check` signale un produit publié incomplet comme erreur bloquante.

**Facettes :** un filtre (couleur, disponibilité, tri par prix) n'apparaît que lorsque des produits le renseignent. Aucun filtre vide n'est affiché.

## Gestion du catalogue

Il n'y a pas d'administration en ligne (retirée à la demande de la boutique) : les données se modifient dans `src/data/*.json`, se vérifient avec `npm run check`, puis le site est recompilé et redéployé.

Pour une administration en ligne plus tard : base de données authentifiée (ex. Supabase), `loadPublished()` de `services/dataSource.js` remplacé par un appel API (même forme de données), connexion obligatoire côté serveur, et un fournisseur `api` dans `services/checkout.js` pour enregistrer et suivre les commandes.

## Commande et paiement (processus Senemaille)

Carte produit → **fiche en fenêtre** → « Ajouter au panier » → **panier latéral** → « Commander » → **fenêtre de commande en 4 étapes** :
1. coordonnées (nom, téléphone sénégalais normalisé en +221) ;
2. livraison (ville, quartier, adresse ou indications) ;
3. paiement : Wave ou Orange Money (logos officiels) ;
4. récapitulatif, puis « Confirmer et commander sur WhatsApp ».

WhatsApp s’ouvre sur `wa.me/<settings.contact.whatsapp>` avec le message au même format que Senemaille (*INFORMATIONS CLIENT*, *ADRESSE DE LIVRAISON*, *COMMANDE*, *MODE DE PAIEMENT*). Le panier n’est vidé que par « J’ai envoyé ma commande, vider le panier ». Les coordonnées ne sont jamais enregistrées. Aucun paiement en ligne : l’emplacement d’une future API Wave / Orange Money est documenté dans `src/payment/index.js`.

Tant que le numéro WhatsApp n’est pas renseigné, le bouton « Commander » est remplacé par un message « La commande en ligne ouvrira très prochainement ».

## Identité visuelle « Nacre & Cornaline »

| Rôle | Valeur | Origine |
| --- | --- | --- |
| Fond | Nacre `#F7F1EB`, sable `#EFE5DB` | Satin rosé et perles nacrées des photos |
| Texte, boutons | Ébène `#2B1C18` | Contraste fort, laisse la couleur aux bijoux |
| Accent | Cornaline `#9A3F2B` | Perles rouge-orangé (pierre de cornaline) |
| Décor | Laiton `#B8915F` / `#CBA57A` | Fermoirs et perles dorées ; jamais pour du texte sur fond clair |
| Titres | Bodoni Moda (romain et italique) | Élégance éditoriale de la joaillerie |
| Texte | Jost | Géométrique, contemporain, très lisible |
| Signature | « Rang de perles » (`BeadRule`) et arches (`--radius-arch`) | Un fil, des perles, la courbe de la taille |

Boutons rectangulaires en capitales espacées, cartes sans ombre, photos au format 4:5, mouvements limités à des fondus et à un léger zoom des photos. Tous les contrastes de texte respectent WCAG AA (détail dans `src/styles/tokens.css`).

## Différences avec Senemaille

| Sujet | Senemaille | Nouvelle boutique | Raison |
| --- | --- | --- | --- |
| Fiche produit, panier, commande | Fenêtre, panneau, fenêtre 4 étapes | Identiques | Même processus demandé |
| Données | Catalogue + config JS | 6 JSON séparés | Données commerciales à venir |
| Statuts produits | Aucun (tout est en vente) | Brouillon / publié / archivé | Aucune donnée commerciale disponible |
| Animations | Motion, GSAP, Lenis, intro | CSS uniquement | Les produits d'abord, dépendances réduites |
| PWA, carte, favoris, récemment vus | Oui | Non (réactivables) | Pas de besoin confirmé |
| Identité | Vert du logo, Gloock/Figtree, pilules | Nacre & Cornaline, Bodoni/Jost, rectangles | Marque distincte |

## Styles de bayas (catégories)

La boutique ne vend que des bayas. Les 39 modèles sont classés en six styles d'après leurs photos (type de perles dominant) : Cristal & facettes (12), Rocailles & rangs fins (10), Perles tubes (6), Perles nacrées (5), À breloques (4), Fantaisie (2). Chaque modèle porte aussi ses couleurs dominantes (`colors`), relevées sur les photos, qui alimentent le filtre couleur. Ce classement visuel est à confirmer par la boutique (`categoryConfirmed: false`).
