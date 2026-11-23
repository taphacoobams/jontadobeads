// Crée test-data/ : copie de src/data avec deux modèles fictifs mis en vente et un numéro WhatsApp fictif,
// pour tester panier, variantes et commande. Les vraies données ne sont jamais modifiées.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src/data');
const out = path.join(root, 'test-data');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out);
for (const f of fs.readdirSync(src)) fs.copyFileSync(path.join(src, f), path.join(out, f));

const write = (f, d) => fs.writeFileSync(path.join(out, f), JSON.stringify(d, null, 2));
const read = (f) => JSON.parse(fs.readFileSync(path.join(out, f), 'utf8'));

export const FIXTURE = {
  simple: { id: 'BAYA-001', name: 'Modèle de test', price: 5000 },
  variants: { id: 'BAYA-004', name: 'Modèle à options', price: 4000, variants: [{ id: 'v1', label: 'Option A', price: 6000, stock: null }] },
};

const products = read('products.json');
products.products = products.products.map((p) => {
  const f = Object.values(FIXTURE).find((x) => x.id === p.id);
  return f ? { ...p, ...f, status: 'published', availability: 'in_stock' } : p;
});
write('products.json', products);

const settings = read('settings.json');
settings.contact.whatsapp = '221770000000';
write('settings.json', settings);
