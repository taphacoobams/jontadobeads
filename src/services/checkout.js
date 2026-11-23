// Messages WhatsApp préremplis : commande complète et prise de contact (format Senemaille).
import { money } from '../lib/format.js';
import { displayName } from '../lib/catalogue.js';
import { getPaymentMethod } from '../payment/index.js';

const waNumber = (raw) => String(raw ?? '').replace(/\D/g, '');

/** Le numéro WhatsApp de la boutique est-il renseigné ? (condition pour commander) */
export const canOrder = (settings) => waNumber(settings.contact.whatsapp).length >= 8;

export const waLink = (settings, text) => {
  const n = waNumber(settings.contact.whatsapp);
  return n.length >= 8 ? `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ''}` : null;
};

export const contactLink = (settings) => waLink(settings, `Bonjour ${settings.shop.name}, je souhaite avoir des informations sur vos modèles.`);

/**
 * @param {{valid: Array, subtotal: number}} summary  récapitulatif du panier (lib/cart.js)
 * @param {{fullName, phone, city, district, address}} c
 * @param {string} paymentId 'wave' | 'orange-money'
 */
export function orderMessage(summary, c, paymentId, settings) {
  const m = (n) => money(n, settings.commerce);
  const L = [
    `Bonjour ${settings.shop.name},`,
    '',
    'Je souhaite passer une commande.',
    '',
    '*INFORMATIONS CLIENT*',
    '',
    `Nom complet : ${c.fullName}`,
    `Téléphone : ${c.phone}`,
    '',
    '*ADRESSE DE LIVRAISON*',
    '',
    `Ville : ${c.city}`,
    `Quartier : ${c.district}`,
    `Adresse / Indications : ${c.address}`,
    '',
    '*COMMANDE*',
    '',
  ];
  for (const i of summary.valid) {
    L.push(`${displayName(i.product)} (Réf. ${i.product.reference}${i.variant ? `, ${i.variant.label}` : ''}) x ${i.qty} : ${m(i.lineTotal)}${i.qty > 1 ? ` (${m(i.unitPrice)} l’unité)` : ''}`);
  }
  L.push(
    '',
    `Sous-total : ${m(summary.subtotal)}`,
    'Livraison : À confirmer',
    `Total : ${m(summary.subtotal)} (hors livraison)`,
    '',
    '*MODE DE PAIEMENT*',
    '',
    getPaymentMethod(paymentId)?.name ?? '',
    '',
    'Merci de confirmer ma commande,',
    'la disponibilité et les modalités de livraison.',
  );
  return L.join('\n');
}
