/** Réseaux sociaux renseignés dans settings.contact (identifiant sans « @ »), avec leur lien. */
const NETWORKS = [
  { id: 'instagram', label: 'Instagram', url: (h) => `https://www.instagram.com/${h}/` },
  { id: 'tiktok', label: 'TikTok', url: (h) => `https://www.tiktok.com/@${h}` },
  { id: 'snapchat', label: 'Snapchat', url: (h) => `https://www.snapchat.com/add/${h}` },
];

export function socialLinks(contact) {
  return NETWORKS.filter((n) => contact[n.id]).map((n) => {
    const handle = contact[n.id].trim().replace(/^@/, '');
    return { id: n.id, label: n.label, handle: `@${handle}`, href: n.url(handle) };
  });
}
