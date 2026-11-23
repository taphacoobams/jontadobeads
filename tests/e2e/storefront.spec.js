import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { open, isNarrow, captureWindowOpen, openProduct, openCart, TEST_PRODUCT, TEST_VARIANTS } from './helpers.js';

const ROUTES = ['/', '/boutique', '/boutique?categorie=cristal', '/boutique?collection=ensembles-feer', '/blog', '/blog/baya-bine-bine-bijou-de-taille-senegal', '/contact', '/faq', '/mentions-legales', '/confidentialite', '/conditions-utilisation', '/conditions-vente', '/livraison-retours'];
const serious = (violations) => violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`);

test.describe('Pages et ressources', () => {
  for (const path of ROUTES) {
    test(`${path} : sans erreur, sans débordement horizontal`, async ({ page }) => {
      const errors = await open(page, path);
      await expect(page.locator('h1').first()).toBeVisible();
      await page.waitForLoadState('networkidle');
      expect(errors).toEqual([]);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.loading !== 'lazy' && i.naturalWidth === 0).map((i) => i.src));
      expect(broken).toEqual([]);
    });
  }

  test('pages supprimées : 404 (compte, commandes, pages produit, administration)', async ({ page }) => {
    for (const path of ['/compte', '/compte/commandes', '/boutique/baya-031', '/panier', '/commande', '/admin', '/a-propos', '/nimporte-quoi']) {
      await open(page, path);
      await expect(page.getByRole('heading', { level: 1 })).toContainText('détachée du fil');
    }
  });

  test('pages légales : cinq documents, aucun champ « à compléter »', async ({ page }) => {
    await open(page, '/mentions-legales');
    await expect(page.getByRole('navigation', { name: 'Informations légales' }).getByRole('link')).toHaveCount(5);
    for (const path of ['/mentions-legales', '/confidentialite', '/conditions-utilisation', '/conditions-vente', '/livraison-retours']) {
      await page.goto(path);
      await expect(page.locator('.legal__content')).toContainText('Jontado Beads');
      await expect(page.locator('.legal__content')).not.toContainText('compléter');
    }
  });

  test('logos Wave et Orange Money dans le pied de page', async ({ page }) => {
    await open(page, '/');
    const footer = page.locator('.site-footer');
    await footer.locator('.pay-logos').scrollIntoViewIfNeeded();
    await expect(footer.locator('.pay-logos img')).toHaveCount(2);
    await expect(footer.getByAltText('Wave')).toBeVisible();
    await expect(footer.getByAltText('Orange Money')).toBeVisible();
    await expect.poll(() => footer.locator('.pay-logos img').evaluateAll((imgs) => imgs.every((i) => i.complete && i.naturalWidth > 0))).toBe(true);
  });
});

test.describe('Brouillons : aucun produit inventé ni achetable', () => {
  test('les brouillons sont « Bientôt disponible », sans prix ; les modèles en vente passent devant', async ({ page }) => {
    await open(page, '/boutique');
    await expect(page.getByTestId('result-count')).toHaveText('61 modèles');
    await expect(page.locator('.card').first()).toContainText(/FCFA/);
    await page.goto('/boutique?q=baya-031');
    const draft = page.locator('.card[data-ref="BAYA-031"]');
    await expect(draft).toContainText('Bientôt disponible');
    await expect(draft).toContainText('Prix à venir');
    await expect(draft).not.toContainText('FCFA');
  });

  test("la fiche d'un brouillon ne permet pas l'achat", async ({ page }) => {
    await open(page, '/boutique');
    const modal = await openProduct(page, 'BAYA-031');
    await expect(modal.getByRole('heading', { level: 2, name: 'Modèle BAYA-031' })).toBeVisible();
    await expect(modal.getByRole('button', { name: /Ajouter au panier/ })).toHaveCount(0);
    await expect(modal.getByText('Ce modèle sera bientôt proposé à la vente')).toBeVisible();
  });

  test('aucune photo hors des images du catalogue', async ({ page }) => {
    await open(page, '/');
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } });
    const srcs = await page.evaluate(() => [...document.querySelectorAll('main img')].map((i) => new URL(i.currentSrc || i.src).pathname));
    expect(srcs.length).toBeGreaterThan(5);
    for (const s of srcs) expect(s).toMatch(/^\/images\/perles\/(baya|chaine|bijou|parf)-\d{3}-\d-\d+\.webp$/);
  });
});

test.describe('Recherche, filtres, pagination', () => {
  test('recherche par référence', async ({ page }) => {
    await open(page, '/boutique');
    await page.getByRole('searchbox', { name: 'Rechercher un modèle' }).fill('baya-031');
    await expect(page.getByTestId('result-count')).toHaveText('1 modèle');
    await expect(page).toHaveURL(/q=baya-031/);
    await page.getByRole('button', { name: 'Effacer la recherche' }).click();
    await expect(page.getByTestId('result-count')).toHaveText('61 modèles');
  });

  test('recherche sans résultat puis réinitialisation', async ({ page }) => {
    await open(page, '/boutique?q=zzzz');
    await expect(page.getByText('Aucun modèle ne correspond')).toBeVisible();
    await page.getByRole('button', { name: 'Effacer les filtres' }).click();
    await expect(page.getByTestId('result-count')).toHaveText('61 modèles');
  });

  test('six styles de bayas, plus de perles ni d’accessoires ; filtres style et couleur', async ({ page }) => {
    await open(page, '/boutique');
    if (isNarrow(page)) await page.getByRole('button', { name: /Filtres/ }).click();
    const scope = isNarrow(page) ? page.getByTestId('filters') : page.locator('.catalogue__aside');
    for (const label of ['Cristal & facettes', 'Rocailles & rangs fins', 'Perles tubes', 'Perles nacrées', 'À breloques', 'Fantaisie']) {
      await expect(scope.getByLabel(new RegExp(`^${label}\\s*\\d+$`))).toBeVisible();
    }
    await expect(scope.getByLabel('Accessoires')).toHaveCount(0);
    await scope.getByLabel('À breloques').click();
    await expect(page).toHaveURL(/categorie=breloques/);
    await expect(scope.getByLabel('À breloques')).toBeChecked();
    await scope.getByLabel('Bleu', { exact: true }).click();
    if (isNarrow(page)) await page.getByRole('button', { name: /Voir 1 modèle/ }).click();
    await expect(page).toHaveURL(/categorie=breloques/);
    await expect(page).toHaveURL(/couleur=Bleu/);
    await expect(page.getByTestId('result-count')).toHaveText('1 modèle');
    await expect(page.locator('.catalogue__results .card[data-ref="BAYA-025"]')).toBeVisible();
  });

  test('accueil : les neuf catégories mènent à la boutique filtrée', async ({ page }) => {
    await open(page, '/');
    await expect(page.locator('#styles .cat-tile')).toHaveCount(9);
    await page.locator('#styles').getByRole('link', { name: /Perles nacrées/ }).click();
    await expect(page).toHaveURL(/categorie=nacrees/);
    await expect(page.getByTestId('result-count')).toHaveText('7 modèles');
  });

  test('chargement progressif', async ({ page }) => {
    await open(page, '/boutique');
    const per = isNarrow(page) ? 12 : 16;
    await expect(page.locator('.catalogue__results .card')).toHaveCount(per);
    await page.getByRole('button', { name: 'Afficher plus de modèles' }).click();
    await expect(page.locator('.catalogue__results .card')).toHaveCount(per * 2);
  });

  test('collections : filtre de la boutique, anciennes adresses redirigées', async ({ page }) => {
    await open(page, '/collections/aguadi');
    await expect(page).toHaveURL(/\/boutique\?collection=aguadi$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Aguadi');
    await expect(page.getByTestId('result-count')).toHaveText('3 modèles');
    await page.goto('/collections');
    await expect(page).toHaveURL(/\/boutique$/);
    if (isNarrow(page)) await page.getByRole('button', { name: /Filtres/ }).click();
    const scope = isNarrow(page) ? page.getByTestId('filters') : page.locator('.catalogue__aside');
    await scope.getByLabel(/^Ensembles Féér/).click();
    await expect(page).toHaveURL(/collection=ensembles-feer/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ensembles Féér');
  });
});

test.describe('Navigation et fiche produit', () => {
  test('menu (mobile) ou navigation principale', async ({ page }) => {
    await open(page, '/');
    if (isNarrow(page)) {
      await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
      const menu = page.getByTestId('menu');
      await expect(menu).toBeVisible();
      await menu.getByRole('link', { name: 'FAQ', exact: true }).click();
      await expect(menu).toBeHidden();
    } else {
      await page.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', { name: 'FAQ' }).click();
    }
    await expect(page).toHaveURL(/\/faq$/);
  });

  test('fiche en fenêtre depuis l’accueil, galerie, fermeture', async ({ page }) => {
    await open(page, '/');
    await page.locator('.selection .card__link').first().click();
    const modal = page.getByTestId('product-modal');
    await expect(modal).toBeVisible();
    await expect(page).toHaveURL(/\/$/); // aucune page produit : l'adresse ne change pas
    await page.keyboard.press('Escape');
    await expect(modal).toHaveCount(0);

    await page.goto('/boutique');
    const m2 = await openProduct(page, 'BAYA-031');
    await expect(m2.locator('.gallery__count')).toHaveText('1 / 3');
    await m2.getByRole('button', { name: 'Photo suivante' }).click();
    await expect(m2.locator('.gallery__count')).toHaveText('2 / 3');
    await m2.getByRole('button', { name: 'Voir la photo 3' }).click();
    await expect(m2.locator('.gallery__count')).toHaveText('3 / 3');
    await m2.getByRole('button', { name: 'Fermer la fiche produit' }).click();
    await expect(m2).toHaveCount(0);
  });
});

test.describe('Panier et commande WhatsApp (données d’essai)', () => {
  test('ajout depuis la fiche, panier latéral, quantités, totaux, persistance, suppression', async ({ page }) => {
    await open(page, '/boutique');
    const modal = await openProduct(page, TEST_PRODUCT.ref);
    await modal.getByRole('button', { name: 'Augmenter la quantité' }).click();
    await modal.getByRole('button', { name: /Ajouter au panier/ }).click();
    await expect(modal.getByRole('status')).toContainText('2 × « Modèle de test » ajouté au panier');
    await expect(page.getByTestId('cart-count')).toHaveText('2');
    await modal.getByRole('button', { name: 'Voir le panier' }).click();
    const cart = page.getByTestId('cart');
    await expect(cart).toBeVisible();
    await expect(cart.getByTestId('cart-subtotal')).toHaveText(/10\s000\sFCFA/);
    await cart.getByRole('button', { name: 'Augmenter la quantité' }).click();
    await expect(cart.getByTestId('cart-total')).toHaveText(/15\s000\sFCFA/);
    await expect(cart.getByAltText('Wave')).toBeVisible();
    await page.reload();
    const again = await openCart(page);
    await expect(again.getByTestId('cart-total')).toHaveText(/15\s000\sFCFA/);
    await again.getByRole('button', { name: /Supprimer/ }).click();
    await expect(again.getByText('Votre panier est vide.')).toBeVisible();
  });

  test('commande en 4 étapes : validation, Wave / Orange Money, récapitulatif, message WhatsApp, vider le panier', async ({ page }) => {
    await captureWindowOpen(page);
    await open(page, '/boutique');
    const modal = await openProduct(page, TEST_PRODUCT.ref);
    await modal.getByRole('button', { name: /Ajouter au panier/ }).click();
    await modal.getByRole('button', { name: 'Voir le panier' }).click();
    await page.getByTestId('cart').getByRole('button', { name: 'Commander' }).click();
    const co = page.getByTestId('checkout');
    await expect(co).toBeVisible();

    await co.getByRole('button', { name: 'Continuer' }).click();
    await expect(co.getByText('Indiquez votre nom complet.')).toBeVisible();
    await co.getByLabel('Nom complet').fill('Awa Diop');
    await co.getByLabel('Numéro de téléphone').fill('12');
    await co.getByRole('button', { name: 'Continuer' }).click();
    await expect(co.getByText(/^Numéro invalide/)).toBeVisible();
    await co.getByLabel('Numéro de téléphone').fill('612345678');
    await co.getByRole('button', { name: 'Continuer' }).click();
    await expect(co.getByText(/^Numéro invalide/)).toBeVisible(); // numéro étranger sans indicatif
    await co.getByLabel('Numéro de téléphone').fill('77 123 45 67');
    await co.getByRole('button', { name: 'Continuer' }).click();

    await co.getByLabel('Ville').fill('Dakar');
    await co.getByLabel('Quartier').fill('Mermoz');
    await co.getByLabel('Adresse détaillée ou indications').fill('Rue 10, portail bleu');
    await co.getByRole('button', { name: 'Continuer' }).click();

    await co.getByRole('button', { name: 'Continuer' }).click();
    await expect(co.getByText('Choisissez Wave ou Orange Money pour continuer.')).toBeVisible();
    await expect(co.locator('.pay-option')).toHaveCount(2);
    await co.locator('.pay-option', { hasText: 'Orange Money' }).click();
    await co.getByRole('button', { name: 'Continuer' }).click();

    await expect(co.locator('.recap')).toContainText('+221 77 123 45 67');
    await expect(co.getByTestId('recap-total')).toHaveText(/5\s000\sFCFA/);
    await co.getByRole('button', { name: 'Confirmer et commander sur WhatsApp' }).click();

    await expect(co.getByRole('heading', { name: 'Votre commande est prête dans WhatsApp' })).toBeVisible();
    const [url] = await page.evaluate(() => window.__opened);
    const u = new URL(url);
    expect(u.hostname).toBe('wa.me');
    expect(u.pathname).toBe('/221770000000');
    const msg = u.searchParams.get('text').replace(/[\u202f\u00a0]/g, ' ');
    for (const part of ['Bonjour Jontado Beads,', '*INFORMATIONS CLIENT*', 'Nom complet : Awa Diop', 'Téléphone : +221 77 123 45 67', 'Quartier : Mermoz', 'Modèle de test (Réf. BAYA-001) x 1 : 5 000 FCFA', 'Total : 5 000 FCFA (hors livraison)', '*MODE DE PAIEMENT*', 'Orange Money']) {
      expect(msg).toContain(part);
    }
    // Le panier n'est vidé que sur demande.
    await expect(page.getByTestId('cart-count')).toHaveText('1');
    await co.getByRole('button', { name: 'J’ai envoyé ma commande, vider le panier' }).click();
    await expect(page.getByTestId('cart-count')).toHaveCount(0);
    expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain('Awa');
  });

  test('variante obligatoire avant ajout', async ({ page }) => {
    await open(page, '/boutique');
    const modal = await openProduct(page, TEST_VARIANTS.ref);
    await modal.getByRole('button', { name: /Ajouter au panier/ }).click();
    await expect(modal.getByText('Choisissez une option.')).toBeVisible();
    await modal.getByLabel('Option A').check();
    await expect(modal.locator('.pdp__price')).toHaveText(/6\s000\sFCFA/);
    await modal.getByRole('button', { name: /Ajouter au panier/ }).click();
    await expect(page.getByTestId('cart-count')).toHaveText('1');
  });

  test('article non achetable dans le panier : signalé, pas de commande', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('jdb-panier', JSON.stringify([{ id: 'BAYA-031', qty: 1 }])));
    await open(page, '/');
    const cart = await openCart(page);
    await expect(cart.getByText('Indisponible')).toBeVisible();
    await expect(cart.getByRole('button', { name: 'Commander' })).toHaveCount(0);
  });
});

test.describe('Blog', () => {
  test('liste, article avec sources et liens vers la boutique, article inconnu', async ({ page }) => {
    await open(page, '/');
    await page.locator('.journal').getByRole('link', { name: 'Tous les articles' }).click();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.locator('.post-card')).toHaveCount(5);
    await page.getByRole('link', { name: /Le thiouraye, le parfum/ }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Le thiouraye, le parfum de la maison sénégalaise');
    await expect(page.locator('.post__sources li').first()).toBeVisible();
    await page.getByRole('link', { name: /Voir le thiouraye et les muscs/ }).click();
    await expect(page).toHaveURL(/categorie=parfums/);
    await open(page, '/blog/article-inconnu');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('détachée du fil');
  });
});

test.describe('Thème clair / sombre', () => {
  test('suit le système, bascule et mémorise ; logo adapté ; aucune violation grave en sombre', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await open(page, '/boutique');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('.site-header img[src$="nom-sombre.png"]')).toBeVisible();
    await expect(page.locator('.site-header img[src$="nom-clair.png"]')).toBeHidden();
    expect(serious((await new AxeBuilder({ page }).analyze()).violations)).toEqual([]);
    await page.getByRole('button', { name: 'Passer en mode clair' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('.site-header img[src$="nom-clair.png"]')).toBeVisible();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
});

test.describe('Accessibilité (axe-core)', () => {
  for (const path of ['/', '/boutique', '/contact', '/conditions-vente']) {
    test(`${path} : aucune violation grave`, async ({ page }) => {
      await open(page, path);
      await page.waitForLoadState('networkidle');
      expect(serious((await new AxeBuilder({ page }).analyze()).violations)).toEqual([]);
    });
  }

  test('fiche produit, panier et commande ouverts : aucune violation grave', async ({ page }) => {
    await open(page, '/boutique');
    await openProduct(page, TEST_PRODUCT.ref);
    expect(serious((await new AxeBuilder({ page }).include('[data-testid="product-modal"]').analyze()).violations)).toEqual([]);
    await page.getByTestId('product-modal').getByRole('button', { name: /Ajouter au panier/ }).click();
    await page.getByTestId('product-modal').getByRole('button', { name: 'Voir le panier' }).click();
    await expect(page.getByTestId('cart')).toBeVisible();
    expect(serious((await new AxeBuilder({ page }).include('[data-testid="cart"]').analyze()).violations)).toEqual([]);
    await page.getByTestId('cart').getByRole('button', { name: 'Commander' }).click();
    await expect(page.getByTestId('checkout')).toBeVisible();
    expect(serious((await new AxeBuilder({ page }).include('[data-testid="checkout"]').analyze()).violations)).toEqual([]);
  });
});
