// Génère les images web à partir du dossier « perles » (lecture seule : rien n'y est modifié).
//
//   npm run images
//
// - Détecte les doublons exacts (empreinte MD5).
// - Lit la curation manuelle (scripts/photo-curation.json).
// - Convertit les photos « valide » en WebP (480, 960, 1600 px de large, orientation EXIF appliquée)
//   dans public/images/perles/. Les photos « a-verifier » et « exclu » ne sont jamais copiées dans public/.
// - Écrit src/data/photos.json (manifeste utilisé par le site) et docs/PHOTO_INVENTORY.md.
//
// Les fichiers HEIC ne sont pas lisibles par sharp : ils passent par « sips » (macOS) vers un JPEG
// temporaire. Sur une autre plateforme, convertissez-les d'abord en JPEG avec l'outil de votre choix.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Le dossier source s'appelle « perles » (avec un espace final sur le disque d'origine).
const srcDir = fs.readdirSync(root).map((n) => path.join(root, n)).find((p) => /^perles\s*$/.test(path.basename(p)) && fs.statSync(p).isDirectory());
if (!srcDir) throw new Error('Dossier « perles » introuvable à la racine du projet.');

const outDir = path.join(root, 'public/images/perles');
const curation = JSON.parse(fs.readFileSync(path.join(root, 'scripts/photo-curation.json'), 'utf8'));
const WIDTHS = [480, 960, 1600];
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'jdb-img-'));

const files = fs.readdirSync(srcDir).filter((f) => !f.startsWith('.')).sort((a, b) => {
  // Les fichiers listés dans la curation passent en premier : ils deviennent l'original de référence.
  const ca = a in curation ? 0 : 1;
  const cb = b in curation ? 0 : 1;
  return ca - cb || a.localeCompare(b);
});

const md5 = (f) => crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex');

async function readable(file) {
  const meta = await sharp(file).metadata().catch(() => null);
  if (meta && ['jpeg', 'png', 'webp'].includes(meta.format)) return { input: file, format: meta.format };
  const out = path.join(tmp, `${crypto.randomUUID()}.jpg`);
  execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '92', file, '--out', out], { stdio: 'ignore' });
  return { input: out, format: 'heic' };
}

const byHash = new Map();
const photos = [];
const counters = {};

fs.mkdirSync(outDir, { recursive: true });
for (const f of fs.readdirSync(outDir)) if (f.endsWith('.webp')) fs.unlinkSync(path.join(outDir, f));

for (const name of files) {
  const abs = path.join(srcDir, name);
  const hash = md5(abs);
  const bytes = fs.statSync(abs).size;
  if (byHash.has(hash)) {
    byHash.get(hash).duplicates.push(name);
    continue;
  }
  const c = curation[name] ?? { status: 'a-verifier', product: null, role: null, note: 'Photo non examinée : à classer.' };
  const { input, format } = await readable(abs);
  const img = sharp(input).rotate();
  const meta = await img.metadata();
  const portrait = (meta.orientation ?? 1) >= 5;
  const width = portrait ? meta.height : meta.width;
  const height = portrait ? meta.width : meta.height;

  const record = {
    id: null,
    file: name,
    format: path.extname(name).slice(1).toLowerCase() === format ? format : `${format} (extension .${path.extname(name).slice(1)})`,
    width,
    height,
    bytes,
    hash,
    duplicates: [],
    status: c.status,
    product: c.product,
    role: c.role,
    note: c.note,
    lowRes: Math.max(width, height) < 1000,
    src: null,
    variants: [],
  };

  if (c.status === 'valide' && c.product) {
    counters[c.product] = (counters[c.product] ?? 0) + 1;
    record.id = `${c.product.toLowerCase()}-${counters[c.product]}`;
    for (const w of WIDTHS) {
      if (w > width && w !== WIDTHS[0]) continue; // pas d'agrandissement
      const target = Math.min(w, width);
      const out = `${record.id}-${w}.webp`;
      const info = await sharp(input).rotate().resize({ width: target }).webp({ quality: 80 }).toFile(path.join(outDir, out));
      record.variants.push({ w: info.width, h: info.height, src: `/images/perles/${out}` });
    }
    record.src = record.variants.at(-1).src;
  } else {
    record.id = `hors-ligne-${photos.filter((p) => !p.src).length + 1}`;
  }
  byHash.set(hash, record);
  photos.push(record);
  process.stdout.write(`${record.id.padEnd(16)} ${name}\n`);
}

fs.rmSync(tmp, { recursive: true, force: true });

const manifest = {
  generatedAt: new Date().toISOString().slice(0, 10),
  source: 'Dossier « perles » (originaux non modifiés)',
  photos: photos
    .filter((p) => p.src)
    .map(({ id, file, width, height, status, product, role, lowRes, variants }) => ({ id, file, width, height, status, product, role, lowRes, variants })),
};
fs.writeFileSync(path.join(root, 'src/data/photos.json'), `${JSON.stringify(manifest, null, 2)}\n`);

// Inventaire lisible.
const total = files.length;
const unique = photos.length;
const rows = photos.map((p) =>
  `| ${p.src ? `\`${p.id}\`` : '—'} | ${p.file.replace(/\|/g, '\\|')} | ${p.format} | ${p.width} × ${p.height} | ${(p.bytes / 1024).toFixed(0)} Ko | ${p.status}${p.lowRes ? ' (basse résolution)' : ''} | ${p.product ?? '—'} | ${p.role ?? '—'} | ${p.duplicates.length ? p.duplicates.join(', ') : '—'} | ${p.note} |`,
);
const md = `# Inventaire des photos du dossier « perles »

Généré par \`npm run images\` le ${manifest.generatedAt}. Les originaux ne sont ni modifiés, ni déplacés, ni supprimés.

- **Fichiers dans le dossier :** ${total}
- **Photos uniques :** ${unique} (${total - unique} doublons exacts, détectés par empreinte MD5)
- **Publiables (« valide ») :** ${photos.filter((p) => p.status === 'valide').length}, réparties sur ${Object.keys(counters).length} modèles provisoires
- **À vérifier (non publiées) :** ${photos.filter((p) => p.status === 'a-verifier').length}
- **Exclues :** ${photos.filter((p) => p.status === 'exclu').length}

Statuts :
- **valide** : photo du produit, convertie en WebP (480, 960 et 1600 px au plus) dans \`public/images/perles/\`.
- **a-verifier** : droits d'utilisation ou contenu à confirmer. Jamais copiée dans \`public/\`.
- **exclu** : inutilisable comme photo commerciale.

Les notes décrivent uniquement ce qui est visible. Elles ne constituent ni un nom, ni une couleur commerciale, ni une matière.

| ID web | Fichier source | Format réel | Dimensions | Poids | Statut | Modèle | Rôle | Doublons exacts | Observation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${rows.join('\n')}
`;
fs.writeFileSync(path.join(root, 'docs/PHOTO_INVENTORY.md'), md);
console.log(`\n${unique} photos uniques, ${manifest.photos.length} publiées dans public/images/perles.`);
