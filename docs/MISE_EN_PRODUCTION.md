# À configurer avant la mise en production

Toutes les données se renseignent dans `src/data/` (voir README), puis `npm run check`.

## Bloquant pour vendre

| # | Élément | Où |
| --- | --- | --- |
| 1 | **Informations de chaque produit** : nom, prix, disponibilité (et idéalement descriptions, couleurs, tailles), puis statut « Publié » | `products.json` |
| 2 | **Catégorie de chaque produit** : toutes provisoirement classées « Bayas » ; certains rangs (perles tubes, fermoirs) pourraient relever des « Perles » | `products.json` |
| 3 | **Regroupements de photos** à confirmer (ex. BAYA-028 : deux photos supposées du même modèle) | `products.json`, docs/PHOTO_INVENTORY.md |
| 4 | **Numéro WhatsApp** qui recevra les commandes (active le bouton « Commander ») | `settings.json` |
| 5 | **Livraison** : texte affiché (frais confirmés sur WhatsApp, comme Senemaille) | `settings.json` |
| 6 | **Retours et échanges** | `settings.json` |
| 7 | **Hébergeur** (nom, pays, site) pour les mentions légales | `settings.json` → `legal.host` |
| 8 | **Relecture juridique** des CGV, de la politique de confidentialité et du cadre légal applicable (marché cible à confirmer : le site est réglé en FCFA, `fr-SN`) | Professionnel du droit |

## Contenu et image de marque

- Collection « Aguadi » : nom relevé dans des noms de fichiers ; titre et présentation à confirmer.
- Textes de l'accueil, À propos et FAQ : proposés, à relire puis cocher « validés » (`content.json`).
- **Logo officiel** : intégré (`public/images/brand/`, originaux `logo-original-fond-*.jpg`). Le logo est écrit « Jontado Bead's », le PDF « Jontado Beads » : orthographe du nom à confirmer. Une version vectorielle (SVG ou PDF) donnerait un rendu plus net.
- Photos `IMG_5363 2.jpg` et `IMG_5364 2.jpg` (mannequin) : origine et droits à vérifier avant toute utilisation.
- Photo `IMG_6601.JPG` (porte-clés gravé d'une photo de personnes) : non publiée ; à décider.
- `IMG_4316.JPG` (BAYA-009) est en basse résolution (564 px) : à remplacer si possible.
- Image de partage (Open Graph) dédiée : actuellement une photo produit.

## Technique

- **Nom de domaine** : renseigner `settings.shop.url`, puis ajouter balise `canonical`, `sitemap.xml` et données structurées `Store`/`Product` (non générés tant que l'adresse est inconnue).
- **Hébergement** : `netlify.toml` est prêt (build, redirection SPA, en-têtes de sécurité, cache). Relier le dépôt Git.
- **Dépôt Git** : le projet n'est pas encore versionné (`git init`). Décider si le dossier `perles` (≈ 70 Mo d'originaux) doit être versionné ou conservé à part.
- **Tests navigateurs** complémentaires : Safari iOS, Firefox.
- **Mesure d'audience** : aucune n'est installée ; en ajouter une impose de mettre à jour la politique de confidentialité.

## Import du PDF « Jontado Beads site » (23/11/2026)

- Noms et prix repris du PDF pour 25 brouillons existants, 27 nouveaux produits créés (BAYA-040 à 052, CHAINE-001 à 004, BIJOU-001 à 003, PARF-001 et 002). Descriptions rédigées d'après les photos : à relire.
- Produits avec prix : publiés avec la disponibilité « Disponible » (`in_stock`), **à confirmer par la boutique**.
- Restent en brouillon : les bayas absentes du PDF (009, 012, 016, 017, 018, 019, 021, 022, 023, 024, 026, 031, 033, 034 : 14 modèles) et la Chaîne de dos Jontado (prix absent).
- À vérifier : « Ensemble Féér » à 5 500 FCFA (prix bas pour un Féér) ; noms en double (trois « Candy kiss », deux « Blanc Éclat », deux « Perles de cheville ») ; droits des photos de 736 px de large (chaînes, bijoux de cuisse et de cheville, senteurs), qui semblent venir de Pinterest et portent parfois la marque d'un autre vendeur (pot Tiouraye).
- Photos issues du PDF (BAYA-040 à 045, 051, 052, BIJOU-003) : ~770 px, à remplacer par les originaux si possible.
- Le dossier source `perles` n'est plus à la racine : **ne pas lancer `npm run images`** sans l'avoir remis (le script régénère toutes les WebP à partir de ce dossier). Les nouvelles images ont été ajoutées directement dans `public/images/perles/` et `src/data/photos.json`.

## Nouveautés du 27/11/2026

- 11 modèles créés à partir des photos envoyées (BAYA-053 à 063) : **noms, descriptions et prix proposés, à confirmer par la boutique**.
- BAYA-054 à 059 : photos de petite taille (350 à 420 px de large) : à remplacer par des originaux plus grands si possible.
- Photos d'ambiance `ambiance-1` et `ambiance-2` (plage) : utilisées sur l'accueil, rattachées à aucun produit.
- Plusieurs de ces photos semblent générées par IA (petit logo ✦ en bas à droite sur certaines) : vérifier qu'elles représentent fidèlement les modèles vendus.
