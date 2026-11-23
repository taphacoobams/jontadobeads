// Moyens de paiement (même fonctionnement que Senemaille).
//
// AUCUN paiement en ligne : le client choisit Wave ou Orange Money dans le formulaire, la commande
// part sur WhatsApp, la boutique confirme puis communique les modalités de règlement. Le site
// n'affiche jamais qu'un paiement a eu lieu.
//
// Brancher plus tard une vraie API (Wave Checkout, Orange Money Web Payment…) :
//  1. créer une fonction serveur (ex. netlify/functions/create-checkout.js) qui détient la clé
//     secrète et crée la session de paiement (jamais de clé dans src/) ;
//  2. appeler cette fonction depuis la dernière étape de la commande ;
//  3. ne montrer un succès qu'après confirmation serveur (webhook).

export const PAYMENT_METHODS = [
  { id: 'wave', name: 'Wave', logo: { src: '/images/payment/wave-logo.png', width: 230, height: 101 } },
  { id: 'orange-money', name: 'Orange Money', logo: { src: '/images/payment/orange-money-logo.svg', width: 431, height: 115 } },
];

export const getPaymentMethod = (id) => PAYMENT_METHODS.find((m) => m.id === id);

export const PAYMENT_NOTE = 'Aucun paiement n’est effectué sur le site : la boutique confirme votre commande sur WhatsApp, puis vous communique les modalités de règlement.';
