import { defineConfig } from '@playwright/test';

// Tests sur un build de production compilé avec des données d'essai (tests/make-fixtures.mjs) :
// deux modèles fictifs en vente et la commande ouverte. Servi sur le port 3101, pour ne pas gêner
// le serveur de développement (3100). Navigateur : Google Chrome installé (channel 'chrome').
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:3101', channel: 'chrome', trace: 'retain-on-failure' },
  projects: [
    { name: 'mobile-390', use: { viewport: { width: 390, height: 844 }, hasTouch: true } },
    { name: 'tablette-768', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'ordinateur-1440', use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: 'node tests/make-fixtures.mjs && JDB_DATA=test-data JDB_OUT=dist-test npx webpack --mode production && npx serve -s dist-test -l 3101',
    url: 'http://localhost:3101',
    reuseExistingServer: false,
    timeout: 180000,
  },
});
