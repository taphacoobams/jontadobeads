// Validation du formulaire de commande (même règles que Senemaille : pas d'e-mail,
// adresse limitée à ville, quartier et indications).

/**
 * Numéros de téléphone, tous pays :
 * - sénégalais (mobiles 70, 71, 72, 75, 76, 77, 78 et fixes 33, 9 chiffres), avec ou sans indicatif
 *   (+221, 00221, 221) : normalisés en « +221 77 123 45 67 » ;
 * - autres pays : avec leur indicatif (+33…, 0033…), 8 à 15 chiffres au total (norme E.164) :
 *   normalisés en « +33 612345678 » (indicatif séparé quand il est reconnaissable, sinon « +chiffres »).
 * Espaces, points, tirets et parenthèses acceptés. Renvoie le numéro normalisé ou null.
 */
export function normalizePhone(raw) {
  const s = String(raw ?? '').trim().replace(/[\s.\-()/]/g, '');
  const sn = s.match(/^(?:\+221|00221|221)?((?:7[0-25-8]|33)\d{7})$/);
  if (sn) {
    const n = sn[1];
    return `+221 ${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5, 7)} ${n.slice(7)}`;
  }
  const intl = s.match(/^(?:\+|00)([1-9]\d{7,14})$/);
  if (!intl) return null;
  const d = intl[1];
  const cc = COUNTRY_CODES.find((c) => d.startsWith(c) && d.length - c.length >= 6);
  return cc ? `+${cc} ${d.slice(cc.length)}` : `+${d}`;
}

/** Indicatifs les plus courants pour la clientèle (Afrique de l'Ouest, Europe, Amérique du Nord, Maghreb). */
const COUNTRY_CODES = ['221', '223', '224', '225', '220', '222', '226', '227', '228', '229', '245', '237', '241', '242', '243', '212', '213', '216', '234', '233', '971', '966', '33', '32', '34', '39', '41', '44', '49', '1'];

export const EMPTY_CUSTOMER = { fullName: '', phone: '', city: '', district: '', address: '' };

/** Renvoie { champ: message } pour l'étape donnée ('customer' | 'address' | 'payment'). */
export function validate(step, c, payment) {
  const e = {};
  if (step === 'customer') {
    if (!c.fullName.trim()) e.fullName = 'Indiquez votre nom complet.';
    else if (c.fullName.trim().length < 2) e.fullName = 'Votre nom semble incomplet.';
    if (!c.phone.trim()) e.phone = 'Indiquez votre numéro de téléphone.';
    else if (!normalizePhone(c.phone)) e.phone = 'Numéro invalide. Exemple : 77 123 45 67, ou avec l’indicatif du pays : +33 6 12 34 56 78.';
  }
  if (step === 'address') {
    if (!c.city.trim()) e.city = 'Indiquez votre ville.';
    if (!c.district.trim()) e.district = 'Indiquez votre quartier.';
    if (!c.address.trim()) e.address = 'Indiquez votre adresse ou des indications pour vous trouver.';
    else if (c.address.trim().length < 6) e.address = 'Ajoutez quelques précisions pour le livreur (rue, bâtiment, repère…).';
  }
  if (step === 'payment' && !payment) e.payment = 'Choisissez Wave ou Orange Money pour continuer.';
  return e;
}
