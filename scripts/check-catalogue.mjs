// Vérifie la cohérence des données de src/data avant publication.
//   npm run check
// Erreurs (bloquantes) : références/slugs en double, photo inexistante, catégorie inconnue,
// produit publié incomplet, collection pointant vers un produit inconnu.
// Avertissements : données commerciales manquantes, photos basse résolution, textes non validés.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => JSON.parse(fs.readFileSync(path.join(root, 'src/data', f), 'utf8'));
const { products } = read('products.json');
const { categories } = read('categories.json');
const { collections } = read('collections.json');
const { photos } = read('photos.json');
const settings = read('settings.json');
const { posts = [] } = fs.existsSync(path.join(root, 'src/data/blog.json')) ? read('blog.json') : {};
const content = read('content.json');

const errors = [];
const warnings = [];
const photoIds = new Set(photos.map((p) => p.id));
const catIds = new Set(categories.map((c) => c.id));
const dup = (list, key) => list.map((x) => x[key]).filter((v, i, a) => a.indexOf(v) !== i);
const AVAIL = ['in_stock', 'made_to_order', 'out_of_stock'];

dup(products, 'reference').forEach((r) => errors.push(`Référence en double : ${r}`));
dup(products, 'slug').forEach((r) => errors.push(`Slug produit en double : ${r}`));
dup(collections, 'slug').forEach((r) => errors.push(`Slug de collection en double : ${r}`));

for (const p of products) {
  if (!['draft', 'published', 'archived'].includes(p.status)) errors.push(`${p.reference} : statut inconnu « ${p.status} »`);
  if (!catIds.has(p.category)) errors.push(`${p.reference} : catégorie inconnue « ${p.category} »`);
  (p.images ?? []).forEach((id) => { if (!photoIds.has(id)) errors.push(`${p.reference} : photo inexistante « ${id} »`); });
  if (p.availability != null && !AVAIL.includes(p.availability)) errors.push(`${p.reference} : disponibilité inconnue « ${p.availability} »`);
  const missing = [!p.name && 'nom', !(p.price > 0) && 'prix', !AVAIL.includes(p.availability) && 'disponibilité', !p.images?.length && 'photo'].filter(Boolean);
  if (p.status === 'published' && missing.length) errors.push(`${p.reference} : publié mais incomplet (${missing.join(', ')})`);
  if (p.status === 'draft' && missing.length) warnings.push(`${p.reference} : brouillon, manque ${missing.join(', ')}`);
  if (p.compareAtPrice != null && !(p.compareAtPrice > p.price)) errors.push(`${p.reference} : ancien prix ≤ prix`);
}
const ids = new Set(products.map((p) => p.id));
for (const c of collections) {
  c.products.forEach((id) => { if (!ids.has(id)) errors.push(`Collection ${c.slug} : produit inconnu ${id}`); });
  if (c.cover && !photoIds.has(c.cover)) errors.push(`Collection ${c.slug} : visuel inexistant ${c.cover}`);
  if (c.titleConfirmed === false) warnings.push(`Collection ${c.slug} : titre à confirmer`);
}
for (const ph of photos) {
  for (const v of ph.variants) if (!fs.existsSync(path.join(root, 'public', v.src))) errors.push(`Fichier image manquant : ${v.src}`);
  if (ph.lowRes) warnings.push(`Photo basse résolution : ${ph.id} (${ph.file})`);
}
dup(posts, 'slug').forEach((s) => errors.push(`Article en double : ${s}`));
for (const p of posts) {
  if (!p.title || !p.slug || !p.date || !p.body?.length) errors.push(`Article ${p.slug ?? '?'} : titre, adresse, date ou contenu manquant`);
  if (p.cover && !photoIds.has(p.cover)) errors.push(`Article ${p.slug} : photo inexistante « ${p.cover} »`);
}
if (!settings.shop.nameConfirmed) warnings.push('Nom de la boutique à confirmer');
if (!content.validated) warnings.push('Textes éditoriaux non validés');

const draftWarnings = warnings.filter((w) => w.includes('brouillon'));
const otherWarnings = warnings.filter((w) => !w.includes('brouillon'));
console.log(`${products.length} produits (${products.filter((p) => p.status === 'published').length} publiés), ${collections.length} collection(s), ${photos.length} photos.`);
if (draftWarnings.length) console.log(`\n${draftWarnings.length} brouillon(s) à compléter (ex. ${draftWarnings[0]}).`);
if (otherWarnings.length) console.log(`\nAvertissements :\n- ${otherWarnings.join('\n- ')}`);
if (errors.length) {
  console.error(`\nERREURS (${errors.length}) :\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log('\nAucune erreur bloquante.');
