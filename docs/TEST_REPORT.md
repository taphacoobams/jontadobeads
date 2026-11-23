# Rapport de tests — 22 novembre 2026

Environnement : macOS, Node 22+, Google Chrome (Playwright, canal `chrome`), build de production servi sur `localhost:3100`.

## Résultats techniques

| Vérification | Commande | Résultat |
| --- | --- | --- |
| Installation des dépendances | `npm install` | OK |
| Compilation de production | `npm run build` | OK, aucune erreur ni avertissement |
| Lint (ESLint 9, règles React Hooks, variables JSX) | `npm run lint` | 0 erreur, 0 avertissement |
| Cohérence des données | `npm run check` | 0 erreur bloquante ; avertissements attendus (39 brouillons, nom de boutique et collection à confirmer, 1 photo basse résolution, textes à valider) |
| TypeScript | — | Sans objet : projet en JavaScript, comme Senemaille |
| Tests de bout en bout | `npm test` | **111 réussis, 0 échec** (37 scénarios × 3 formats) |

Formats testés : mobile 390 × 844 (tactile), tablette 768 × 1024, ordinateur 1440 × 900.

## Couverture

| Domaine | Ce qui est vérifié |
| --- | --- |
| Routes (16) | Chaque page s'affiche avec un titre, sans erreur console, sans ressource locale en échec, sans image cassée, sans défilement horizontal |
| 404 | Adresse inconnue et produit inexistant |
| Données non inventées | Un brouillon n'affiche jamais de prix ; 39 modèles « Bientôt disponible » / « Prix à venir » ; fiche brouillon sans bouton d'ajout ; toutes les images de l'accueil proviennent de `/images/perles/` |
| Recherche | Par référence, effacement, recherche sans résultat et réinitialisation, état conservé dans l'URL |
| Filtres | Catégorie (bureau : colonne ; mobile et tablette : panneau), catégorie vide affichée « arrive bientôt » |
| Pagination | « Afficher plus » (12 par page sur mobile, 16 sur ordinateur) |
| Collections | Page de collection, mention « en préparation », 3 modèles |
| Navigation | Menu mobile (ouverture, lien, fermeture) ; navigation principale sur ordinateur |
| Galerie | Flèches, vignettes, compteur, plein écran, fermeture par Échap |
| Panier | Ajout avec quantité, compteur, message d'ajout, sous-total, total, modification, persistance après rechargement, suppression, panier vide |
| Variantes | Choix obligatoire, prix de la variante |
| Commande | Validation de chaque étape, normalisation du téléphone, récapitulatif, URL et contenu du message WhatsApp, page de confirmation, panier vidé, historique sans nom ni adresse |
| Commandes fermées | Article non achetable signalé « Indisponible », pas de bouton « Passer commande », `/commande` renvoie au panier |
| Accessibilité (axe-core) | Accueil, boutique, fiche, panier, contact, CGV : aucune violation grave ou critique |

Les tests tournent sur une compilation séparée (`dist-test/`, port 3101) avec des données d'essai générées par `tests/make-fixtures.mjs` : deux modèles fictifs en vente et un numéro WhatsApp fictif. Les vraies données ne sont pas modifiées.

## Défauts trouvés et corrigés pendant les tests

1. **Commande :** après l'envoi, le panier vidé déclenchait une redirection vers `/panier` avant la page de confirmation. Corrigé (`Checkout.jsx`).
2. **Catégorie vide :** affichait « Aucun modèle ne correspond à votre recherche » au lieu de « Cette sélection arrive bientôt ». Corrigé (`CatalogueView.jsx`).
3. **Accessibilité :** le nom accessible du logo ne contenait pas le texte visible. Corrigé (texte visible + « (accueil) » masqué).
4. **`window.open` avec `noopener`** renvoie toujours `null` et aurait signalé à tort une fenêtre bloquée. Corrigé.

## Vérifications visuelles

Captures pleine page à 390 et 1440 px (accueil, boutique, fiche). Contrôlé : hiérarchie, rythme des sections, lisibilité des cartes, cohérence de la palette et des typographies, absence de débordement. Comparé aux principes de Senemaille : en-tête collant avec compteur, catalogue filtrable, commande guidée, pages légales sans information inventée, gestion du focus et des annonces ARIA.

## Non testé

- Safari / iOS et Firefox (seul Chrome a été piloté).
- Envoi réel d'un message WhatsApp (l'URL générée est vérifiée, pas l'application).
- Performances mesurées (Lighthouse) et comportement sur réseau lent.

## Mise à jour du 22 novembre 2026

Administration retirée, nom de la boutique fixé à « Jontadobeads ». Lint, build, `npm run check` et 111 tests repassés sans erreur.

## Mise à jour : processus de commande Senemaille (22 novembre 2026)

Fiche produit en fenêtre, panier latéral, commande en 4 étapes avec Wave / Orange Money, compte client supprimé, 5 pages légales, port 3000. Lint et build sans erreur ; **105 tests réussis, 0 échec** (35 scénarios × 3 formats), dont :
- anciennes adresses (`/compte`, `/panier`, `/commande`, `/boutique/<modèle>`, `/admin`) → page 404 ;
- 5 pages légales, aucune mention « à compléter » ;
- logos Wave et Orange Money chargés (pied de page, panier, fiche, étape paiement) ;
- fiche en fenêtre sans changement d’adresse, galerie, fermeture (bouton et Échap) ;
- commande complète : erreurs de validation, choix du paiement obligatoire, récapitulatif, contenu exact du message WhatsApp, panier conservé jusqu’à « J’ai envoyé ma commande, vider le panier », aucune coordonnée dans le stockage local ;
- axe-core sur les pages et sur la fiche, le panier et la commande ouverts.

Défaut corrigé : le verrouillage du défilement sautait quand le panier se fermait pendant l’ouverture de la commande.

## Mise à jour : six styles de bayas (22 novembre 2026)

Perles et Accessoires retirés, six styles de bayas et couleurs dominantes établis d'après les photos, page À propos supprimée, crédit « Réalisé par Hypetech Digital » ajouté comme sur Senemaille. **105 tests réussis, 0 échec**, dont : les six styles dans les filtres, filtre combiné style + couleur, tuiles de l'accueil vers la boutique filtrée, `/a-propos` en 404.

Défaut corrigé : l'accueil restait blanc après la suppression du contenu « Perles » (section encore appelée).
