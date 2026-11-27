# Jontado Beads — bijoux et accessoires artisanaux

Boutique en ligne de **Jontado Beads** (« Ibadou biy diar féér ») : bayas (perles de taille), chaînes de corps, bijoux de cuisse et de cheville, senteurs. Construite sur les conventions du projet Senemaille (React 19, Webpack 5), avec son identité « Nacre & Cornaline », le logo officiel, un mode clair / sombre et une introduction animée à l'arrivée.

> **État actuel :** 72 modèles, dont 57 en vente (noms et prix du PDF « Jontado Beads site », plus 11 nouveautés du 27/11/2026 dont le prix est à confirmer). 15 brouillons attendent nom et prix. Voir [docs/MISE_EN_PRODUCTION.md](docs/MISE_EN_PRODUCTION.md).

## Démarrage

```bash
npm install
npm start            # http://localhost:3000 (développement)
npm run build        # production dans dist/
npm run serve        # sert dist/ sur http://localhost:3000
```

Node.js 22 ou plus récent.

| Commande | Rôle |
| --- | --- |
| `npm run images` | Régénère les WebP depuis le dossier `perles` (**absent du dépôt** : ne pas lancer sans l'avoir remis, voir MISE_EN_PRODUCTION) |
| `npm run check` | Vérifie la cohérence des données avant publication |
| `npm run lint` | ESLint |
| `npm test` | Tests Playwright + axe-core (3 formats ; `npx playwright install chrome` la première fois si Chrome est absent) |

## Pages

Accueil · Boutique (recherche, filtres par catégorie, collection, couleur et disponibilité, tri, chargement progressif) · Blog (5 articles sourcés) · Contact · FAQ · Mentions légales · Confidentialité · Conditions d’utilisation · Conditions de vente · Livraison et retours · 404.

Comme sur Senemaille : la **fiche produit s’ouvre en fenêtre** (pas de page produit), le **panier est un panneau latéral**, et la **commande se fait en 4 étapes** (coordonnées, livraison, paiement Wave ou Orange Money, récapitulatif) avant l’ouverture de WhatsApp avec le message déjà rédigé. Le panier n’est vidé que sur demande (« J’ai envoyé ma commande, vider le panier »). Pas de compte client.

## Gérer la boutique

Les données sont dans `src/data/` :

| Fichier | Contenu |
| --- | --- |
| `products.json` | Produits : nom, prix, descriptions, photos, variantes, stock, disponibilité, statut (`draft` / `published` / `archived`) |
| `collections.json`, `categories.json` | Collections et les six styles de bayas : cristal & facettes, rocailles & rangs fins, perles tubes, perles nacrées, à breloques, fantaisie |
| `settings.json` | Nom, contact (le numéro WhatsApp active la commande), texte de livraison, hébergeur |
| `content.json` | Textes de l'accueil et FAQ |
| `blog.json` | Articles du blog (blocs de texte, photo de couverture, sources) |

Un produit devient achetable quand il est `published` avec un nom, un prix et une disponibilité. Après modification : `npm run check`, puis `npm run build` et déploiement.

Le bouton « Commander » apparaît dès que `contact.whatsapp` est renseigné (format `221XXXXXXXXX`). Aucun paiement n'est pris sur le site.

## Documentation

| Fichier | Contenu |
| --- | --- |
| [docs/AUDIT_SENEMAILLE.md](docs/AUDIT_SENEMAILLE.md) | Audit du projet de référence, inventaire des composants, décisions |
| [docs/PHOTO_INVENTORY.md](docs/PHOTO_INVENTORY.md) | Inventaire des 63 fichiers du dossier `perles` (formats, dimensions, doublons, statut, modèle) |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Architecture, modèle de données, gestion du catalogue, commande, identité visuelle, différences avec Senemaille |
| [docs/TEST_REPORT.md](docs/TEST_REPORT.md) | Résultats des tests |
| [docs/MISE_EN_PRODUCTION.md](docs/MISE_EN_PRODUCTION.md) | Ce qui reste à fournir ou configurer |
