import { expect } from '@playwright/test';

export const isNarrow = (page) => (page.viewportSize()?.width ?? 1440) < 1024;

/** Modèles fictifs mis en vente dans les données d'essai (tests/make-fixtures.mjs). */
export const TEST_PRODUCT = { ref: 'BAYA-001', name: 'Modèle de test', price: 5000 };
export const TEST_VARIANTS = { ref: 'BAYA-004' };

/** Ouvre une page en relevant erreurs console, erreurs JS et ressources locales en échec. */
export async function open(page, path = '/') {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith('http://localhost')) errors.push(`${r.status()} ${r.url()}`); });
  await page.goto(path);
  return errors;
}

/** Ouvre la fiche (fenêtre) d'un modèle depuis sa carte dans la boutique. */
export async function openProduct(page, ref) {
  if (!page.url().includes('/boutique')) await page.goto('/boutique');
  await page.getByRole('searchbox', { name: 'Rechercher un modèle' }).fill(ref);
  await expect(page.getByTestId('result-count')).toHaveText('1 modèle');
  await page.locator(`.card[data-ref="${ref}"] .card__link`).click();
  const modal = page.getByTestId('product-modal');
  await expect(modal).toBeVisible();
  return modal;
}

export async function openCart(page) {
  await page.locator('.cart-btn').click();
  const cart = page.getByTestId('cart');
  await expect(cart).toBeVisible();
  return cart;
}

/** Remplace window.open pour capturer l'URL WhatsApp sans quitter la page. */
export async function captureWindowOpen(page) {
  await page.addInitScript(() => {
    window.__opened = [];
    window.open = (url) => { window.__opened.push(String(url)); return {}; };
  });
}
