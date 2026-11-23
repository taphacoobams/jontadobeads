# Audit du projet de référence Senemaille

Audit réalisé le 22 novembre 2026 en lecture seule sur `../senemaille` : aucun fichier n'y a été modifié.

## 0. Projets identifiés

| Rôle | Chemin | Constat |
| --- | --- | --- |
| Projet source (référence) | `Documents/Projets/senemaille` | Dépôt Git, React 19, déjà documenté (README, AUDIT, DESIGN_SYSTEM, IMPLEMENTATION, TEST_REPORT) |
| Projet de destination | `Documents/Projets/jontadobeads` | Contenait uniquement le dossier de photos, sans code |
| Photos | `jontadobeads/perles ` | **Le nom du dossier se termine par un espace.** Les scripts le retrouvent par motif (`/^perles\s*$/`) |

Les deux projets sont distincts : aucune dépendance, aucun lien symbolique, aucun fichier partagé.

## 1. Architecture technique

| Élément | Senemaille |
| --- | --- |
| Framework | React 19.3 (fonctions + hooks), JavaScript (pas de TypeScript) |
| Routage | React Router 7 (`BrowserRouter`), routes déclarées dans `src/App.jsx`, page Contact chargée à la demande |
| Compilation | Webpack 5 + Babel (le projet a quitté Vite à la demande du client), découpage `react` / `gsap` / `icons` |
| État | Contextes React : `CartContext` (useReducer), `ShopContext` (favoris, vus récemment), `ProductModalContext`, `IntroContext` |
| Logique métier | Fonctions pures dans `src/lib/` (`cart.js`, `catalogue.js`, `validation.js`, `whatsapp.js`, `format.js`) |
| Données | `src/data/catalogue.json` (58 produits extraits de l'ancien site), réglages dans `src/config/site.js` |
| Styles | CSS natif : `tokens.css` (variables), `base.css`, `main.css` (780 lignes) ; aucune bibliothèque UI |
| Animations | Motion (ex-Framer Motion), GSAP + ScrollTrigger, Lenis (défilement fluide), intro animée |
| Icônes / polices | lucide-react ; Gloock + Figtree via @fontsource (hébergées localement) |
| Stockage | `localStorage` : panier, favoris, vus récemment. Aucune donnée personnelle conservée |
| API / BDD | **Aucune.** Pas de serveur, pas d'authentification |
| Commande | Formulaire en 4 étapes validé, puis message WhatsApp prérempli ; paiement Wave/Orange Money hors site |
| Administration | **Aucune.** Le catalogue se modifie dans le JSON |
| PWA | Workbox (service worker), manifeste, page « Installer » |
| Tests | Playwright (6 formats d'écran) + axe-core ; 220 tests |
| Hébergement | Netlify (`netlify.toml` : redirection SPA, en-têtes de sécurité, cache) |

**Pourquoi cette organisation :** boutique sans serveur, catalogue de taille modeste, commandes traitées humainement sur WhatsApp. Tout ce qui change souvent (produits, coordonnées) est centralisé dans deux fichiers ; la logique est isolée en fonctions pures testables ; les composants restent petits.

## 2. Organisation des dossiers

```
src/
├── main.jsx, App.jsx        entrée, fournisseurs, routes
├── config/site.js           réglages centraux (contact, livraison, mentions, clés de stockage)
├── data/catalogue.json      catégories et produits
├── pages/                   Home, Shop, Contact, Install, NotFound, legal/
├── components/              layout/, checkout/, intro/, cartes, modales, galerie
├── context/                 Cart, Shop, ProductModal
├── lib/                     fonctions pures
├── hooks/                   usePageMeta, useMediaQuery, useInstallPrompt
├── motion/                  Lenis, jetons de mouvement
├── payment/                 moyens de paiement et point d'extension API
└── styles/                  tokens.css, base.css, main.css
evolution/                   24 fonctionnalités désactivées (code en commentaire)
legacy/                      ancien site figé
```

## 3. Inventaire des pages

| Route | Contenu |
| --- | --- |
| `/` | Hero cinématique (sacs « suspendus »), univers, sélection, nouveautés, savoir-faire, personnalisation, « comment commander », bandeau contact |
| `/boutique` | Recherche avec suggestions (combobox ARIA), filtres catégorie/prix/favoris (puces), tri, « afficher plus », récemment consultés |
| *(modale)* | Fiche produit : galerie avec zoom, prix, quantité, personnalisation, favoris, ajout au panier |
| *(tiroirs)* | Panier, favoris, menu mobile (`<dialog>` natif) |
| *(modale)* | Commande en 4 étapes : coordonnées, adresse, paiement, récapitulatif → WhatsApp |
| `/contact` | Carte Leaflet, adresse lisible |
| `/installer` | Installation PWA |
| 5 pages légales | Mentions, confidentialité, CGU, CGV, livraison-retours (informations vérifiées seulement) |
| `*` | 404 |

Parcours observés : en-tête collant avec compteur de panier, fiche produit en modale (pas d'URL propre), panier en tiroir latéral, aucune barre de navigation fixe en bas sur mobile, retour en haut à chaque changement de page.

## 4. Inventaire des composants

| Composant Senemaille | Décision pour la nouvelle boutique |
| --- | --- |
| `layout/Layout`, `Header`, `Footer`, `MobileMenu`, `Logo` | **Adapté** : même structure (lien d'évitement, gestion du défilement, annonces ARIA), nouvelle identité, navigation adaptée |
| `Modal` (`<dialog>` natif) | **Repris et allégé** : mêmes garanties (focus, Échap, retour du focus), transitions CSS au lieu de Motion |
| `ProductCard`, `ProductImage` | **Adaptés** : états « Bientôt disponible » / « Prix à venir », seconde photo au survol, images responsives |
| `ProductGallery` | **Adapté** : vignettes, flèches, glisser, clavier ; zoom remplacé par un plein écran |
| `checkout/Field` | **Repris** (`ui.jsx` → `Field`) |
| `checkout/CheckoutModal` | **Adapté en page** `/commande` (3 étapes, mode de livraison configurable, fournisseur de commande abstrait) |
| `CartDrawer` | **Remplacé** par une page `/panier` + message éphémère d'ajout |
| `FavoritesDrawer`, `FavoriteButton`, récemment consultés | Non repris (hors périmètre demandé, réactivables plus tard) |
| `IntroSplash`, GSAP, Lenis, `AnimatedNumber`, `SplitTitle` | **Non repris** : la consigne demande des animations qui ne détournent pas l'attention des produits |
| `LocationMap` (Leaflet), `Install`, `PaymentLogos` | Non repris : aucune adresse, aucun moyen de paiement ni besoin PWA confirmés |
| `lib/cart`, `lib/validation`, `lib/whatsapp`, `lib/format` | **Repris et étendus** (variantes, lignes indisponibles, numéros internationaux) |
| `hooks/usePageMeta`, `useMediaQuery` | **Repris** (+ `noindex`) |
| `payment/index.js` (point d'extension API) | **Repris comme principe** dans `services/checkout.js` |
| — | **Créés** : `CatalogueView`, `Photo`, `BeadRule`, `Breadcrumbs`, `EmptyState`, `Pending`, `StoreContext`, `services/dataSource`, `services/orders`, l'administration complète |

## 5. Fonctionnalités identifiées

Catalogue filtrable et cherchable ; panier persistant multi-onglets ; commande validée champ par champ ; message WhatsApp structuré ; pages légales sans information inventée ; métadonnées par page et JSON-LD ; PWA hors ligne ; accessibilité vérifiée (axe) ; principe affirmé « aucune donnée inventée ».

## 6 à 8. Réutiliser, adapter, créer

- **Réutilisé tel quel (principes et code) :** Webpack/Babel, React Router, organisation `config / data / lib / context / hooks / pages / components / styles`, fonctions pures, `<dialog>` natif, validation, Netlify, tests Playwright + axe, règle « ne rien inventer ».
- **Adapté :** fiche produit en vraie page (URL partageable, référencement), panier en page, commande en page, recherche, cartes, palette et typographies.
- **Créé :** séparation données publiées / brouillon d'administration, statut de publication des produits, règles « achetable », collections, pipeline d'images HEIC → WebP, administration, compte et historique de commandes local.

## 9. Recommandations retenues

1. Garder la pile Senemaille (React 19 + Webpack 5, pas de TypeScript) pour la cohérence entre les deux projets.
2. Alléger les dépendances : pas de GSAP, Lenis, Motion, Leaflet ni Workbox tant qu'ils ne servent pas un besoin confirmé.
3. Donner aux produits un **statut** (brouillon/publié/archivé) et une règle unique `isPurchasable()`.
4. Rendre la fiche produit adressable (`/boutique/:slug`).
5. Préparer une administration réellement opérationnelle sans serveur, avec un point de bascule clair vers une base de données.
