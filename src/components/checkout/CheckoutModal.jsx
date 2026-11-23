import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, ExternalLink } from 'lucide-react';
import Modal from '../Modal.jsx';
import WhatsAppIcon from '../WhatsAppIcon.jsx';
import { Field } from '../ui.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import { displayName } from '../../lib/catalogue.js';
import { money } from '../../lib/format.js';
import { EMPTY_CUSTOMER, normalizePhone, validate } from '../../lib/validation.js';
import { canOrder, orderMessage, waLink } from '../../services/checkout.js';
import { PAYMENT_METHODS, PAYMENT_NOTE, getPaymentMethod } from '../../payment/index.js';

const STEPS = [
  { id: 'customer', label: 'Coordonnées' },
  { id: 'address', label: 'Livraison' },
  { id: 'payment', label: 'Paiement' },
  { id: 'summary', label: 'Récapitulatif' },
];

const trimAll = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, String(v).trim()]));

/**
 * Commande en 4 étapes avant WhatsApp (même processus que Senemaille). Les informations saisies
 * restent en mémoire le temps de la visite : elles ne sont ni enregistrées dans le navigateur ni
 * envoyées à un serveur. Le panier n'est vidé que sur demande, une fois le message envoyé.
 */
export default function CheckoutModal() {
  const { summary, checkoutOpen, closeCheckout, clear, announce } = useCart();
  const { settings } = useStore();
  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState(EMPTY_CUSTOMER);
  const [payment, setPayment] = useState('');
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(null); // { url, blocked }
  const formRef = useRef(null);
  const headingRef = useRef(null);
  const current = STEPS[step];
  const shop = settings.shop.name;

  useEffect(() => {
    if (checkoutOpen && sent) { setSent(null); setStep(0); }
    if (checkoutOpen) setErrors({});
  }, [checkoutOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, [step, sent]);

  const set = (k) => (e) => {
    setCustomer((c) => ({ ...c, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => { const n = { ...er }; delete n[k]; return n; });
  };

  const goTo = (i) => { setErrors({}); setStep(i); };

  const fail = (found) => {
    setErrors(found);
    const n = Object.keys(found).length;
    announce(`${n} information${n > 1 ? 's' : ''} à corriger.`);
    requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"], [data-payment-error] input')?.focus());
  };

  const next = (e) => {
    e.preventDefault();
    const found = validate(current.id, customer, payment);
    if (Object.keys(found).length) { fail(found); return; }
    if (current.id === 'customer') setCustomer((c) => ({ ...c, phone: normalizePhone(c.phone) }));
    goTo(Math.min(STEPS.length - 1, step + 1));
  };

  const confirm = (e) => {
    e.preventDefault();
    for (let i = 0; i < 3; i++) {
      const found = validate(STEPS[i].id, customer, payment);
      if (Object.keys(found).length) { setStep(i); fail(found); return; }
    }
    if (!summary.valid.length || !canOrder(settings)) return;
    const url = waLink(settings, orderMessage(summary, trimAll(customer), payment, settings));
    // Sans « noopener » dans les options (window.open renverrait toujours null) : on coupe le lien ensuite.
    const win = window.open(url, '_blank');
    if (win) win.opener = null;
    setSent({ url, blocked: !win });
    announce(win ? 'WhatsApp s’est ouvert avec votre commande.' : 'Ouvrez WhatsApp avec le bouton pour transmettre votre commande.');
  };

  const empty = !summary.valid.length && !sent;

  return (
    <Modal open={checkoutOpen} onClose={closeCheckout} variant="center" labelledBy="commande-titre" className="checkout-modal" closeLabel="Fermer la commande" testId="checkout">
      <div className="checkout">
        <h2 className="checkout__title" id="commande-titre" tabIndex={-1} ref={headingRef}>
          {sent ? 'Votre commande est prête dans WhatsApp' : 'Finaliser ma commande'}
        </h2>

        {empty && (
          <div className="checkout__empty">
            <p>Votre panier ne contient aucun article disponible : ajoutez au moins un modèle avant de commander.</p>
            <Link className="btn" to="/boutique" onClick={closeCheckout}>Parcourir la boutique</Link>
          </div>
        )}

        {!empty && !sent && (
          <>
            <div className="progress" aria-hidden="true"><span className="progress__bar" style={{ transform: `scaleX(${(step + 1) / STEPS.length})` }} /></div>
            <ol className="steps-nav" aria-label="Étapes de la commande">
              {STEPS.map((s, i) => (
                <li key={s.id} className={i < step ? 'is-done' : i === step ? 'is-current' : ''} aria-current={i === step ? 'step' : undefined}>
                  <span className="steps-nav__num" aria-hidden="true">{i < step ? <Check size={14} /> : i + 1}</span>
                  <span className="steps-nav__label">{s.label}</span>
                </li>
              ))}
            </ol>
            <p className="visually-hidden" aria-live="polite">Étape {step + 1} sur {STEPS.length} : {current.label}</p>

            <form ref={formRef} className="checkout__form" onSubmit={current.id === 'summary' ? confirm : next} noValidate>
              {Object.keys(errors).length > 0 && (
                <div className="form-alert" role="alert">Certaines informations manquent ou sont incorrectes. Corrigez les champs signalés pour continuer.</div>
              )}

              {current.id === 'customer' && (
                <fieldset className="checkout__fields">
                  <legend>Vos coordonnées</legend>
                  <Field id="nom" label="Nom complet" required autoComplete="name" placeholder="Prénom et nom" value={customer.fullName} onChange={set('fullName')} error={errors.fullName} />
                  <Field id="telephone" label="Numéro de téléphone" required type="tel" inputMode="tel" autoComplete="tel" placeholder="77 123 45 67" value={customer.phone} onChange={set('phone')} error={errors.phone} help={`Sénégal : avec ou sans +221. Autre pays : avec l’indicatif (ex. +33). ${shop} vous recontacte sur ce numéro.`} />
                </fieldset>
              )}

              {current.id === 'address' && (
                <fieldset className="checkout__fields">
                  <legend>Adresse de livraison</legend>
                  <div className="grid-2">
                    <Field id="ville" label="Ville" required autoComplete="address-level2" value={customer.city} onChange={set('city')} error={errors.city} />
                    <Field id="quartier" label="Quartier" required autoComplete="address-level3" value={customer.district} onChange={set('district')} error={errors.district} />
                  </div>
                  <Field id="adresse" label="Adresse détaillée ou indications" required as="textarea" rows={3} autoComplete="street-address" value={customer.address} onChange={set('address')} error={errors.address} help="Rue, bâtiment, couleur du portail ou un repère utile : près d’une école, d’une boutique, d’une mosquée…" />
                </fieldset>
              )}

              {current.id === 'payment' && (
                <fieldset className="checkout__fields pay-choice" data-payment-error={errors.payment ? '' : undefined} aria-describedby={errors.payment ? 'paiement-erreur' : 'paiement-aide'}>
                  <legend>Mode de paiement</legend>
                  <div className="pay-choice__options">
                    {PAYMENT_METHODS.map((method) => {
                      const on = payment === method.id;
                      return (
                        <label key={method.id} className={`pay-option${on ? ' is-selected' : ''}`}>
                          <input type="radio" name="paiement" value={method.id} checked={on} onChange={() => { setPayment(method.id); setErrors({}); }} />
                          <span className="pay-option__logo"><img src={method.logo.src} width={method.logo.width} height={method.logo.height} alt="" /></span>
                          <span className="pay-option__name">{method.name}</span>
                          <span className="pay-option__tick" aria-hidden="true">{on && <Check size={16} />}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="field__help" id="paiement-aide">{PAYMENT_NOTE}</p>
                  {errors.payment && <p className="field__error" id="paiement-erreur">{errors.payment}</p>}
                </fieldset>
              )}

              {current.id === 'summary' && <Summary summary={summary} customer={customer} payment={payment} onEdit={goTo} settings={settings} />}

              <div className="checkout__nav">
                {step > 0 && <button type="button" className="btn btn--ghost" onClick={() => goTo(step - 1)}><ArrowLeft size={18} aria-hidden="true" /> Retour</button>}
                {current.id !== 'summary' ? (
                  <button type="submit" className="btn">Continuer</button>
                ) : (
                  <button type="submit" className="btn btn--whatsapp"><WhatsAppIcon /> Confirmer et commander sur WhatsApp</button>
                )}
              </div>
            </form>
          </>
        )}

        {sent && (
          <div className="checkout__done">
            {sent.blocked ? (
              <p>Votre navigateur n’a pas ouvert WhatsApp automatiquement. Utilisez le bouton ci-dessous : le message est déjà rédigé.</p>
            ) : (
              <p>WhatsApp s’est ouvert avec votre commande déjà rédigée. <strong>Appuyez sur « Envoyer » dans WhatsApp</strong> pour la transmettre à {shop}.</p>
            )}
            <p>{shop} vous confirmera ensuite la commande, la disponibilité et les modalités de livraison. Le paiement par {getPaymentMethod(payment)?.name} se fait après cette confirmation : aucun paiement n’a été effectué sur ce site.</p>
            <div className="checkout__nav checkout__nav--wrap">
              <a className="btn btn--whatsapp" href={sent.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={18} aria-hidden="true" /> {sent.blocked ? 'Ouvrir WhatsApp' : 'Rouvrir WhatsApp'}</a>
              <button type="button" className="btn btn--ghost" onClick={() => { clear(); setSent(null); setStep(0); setPayment(''); closeCheckout(); announce('Panier vidé.'); }}>
                J’ai envoyé ma commande, vider le panier
              </button>
            </div>
            <p className="field__help">Votre panier reste enregistré tant que vous ne le videz pas.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

function Summary({ summary, customer: c, payment, onEdit, settings }) {
  const pm = getPaymentMethod(payment);
  const m = (n) => money(n, settings.commerce);
  return (
    <div className="recap">
      <section className="recap__block" aria-labelledby="recap-produits">
        <h3 id="recap-produits">Produits</h3>
        <table className="recap__table">
          <thead><tr><th scope="col">Produit</th><th scope="col" className="num">Qté</th><th scope="col" className="num">Prix unitaire</th><th scope="col" className="num">Total</th></tr></thead>
          <tbody>
            {summary.valid.map((i) => (
              <tr key={`${i.id}-${i.variant?.id ?? ''}`}>
                <td><span className="recap__name">{displayName(i.product)}</span><span className="recap__sub">Réf. {i.product.reference}{i.variant ? `, ${i.variant.label}` : ''}</span></td>
                <td className="num">{i.qty}</td>
                <td className="num">{m(i.unitPrice)}</td>
                <td className="num">{m(i.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="totals">
          <div><dt>Sous-total</dt><dd data-testid="recap-subtotal">{m(summary.subtotal)}</dd></div>
          <div><dt>Livraison</dt><dd>{settings.delivery.feeLabel}</dd></div>
          <div className="totals__total"><dt>Total (hors livraison)</dt><dd data-testid="recap-total">{m(summary.subtotal)}</dd></div>
        </dl>
      </section>
      <div className="recap__cols">
        <section className="recap__block" aria-labelledby="recap-client">
          <h3 id="recap-client">Coordonnées</h3>
          <p>{c.fullName}<br />{c.phone}</p>
          <button type="button" className="link-btn" onClick={() => onEdit(0)}>Modifier<span className="visually-hidden"> les coordonnées</span></button>
        </section>
        <section className="recap__block" aria-labelledby="recap-adresse">
          <h3 id="recap-adresse">Livraison</h3>
          <p>{c.city}<br />{c.district}<br />{c.address}</p>
          <button type="button" className="link-btn" onClick={() => onEdit(1)}>Modifier<span className="visually-hidden"> l’adresse</span></button>
        </section>
        <section className="recap__block" aria-labelledby="recap-paiement">
          <h3 id="recap-paiement">Paiement</h3>
          <p className="recap__pay"><img src={pm.logo.src} width={pm.logo.width} height={pm.logo.height} alt="" /> {pm.name}</p>
          <button type="button" className="link-btn" onClick={() => onEdit(2)}>Modifier<span className="visually-hidden"> le mode de paiement</span></button>
        </section>
      </div>
      <p className="recap__note">En confirmant, WhatsApp s’ouvre avec ce récapitulatif. {settings.shop.name} confirme ensuite la commande, la disponibilité et la livraison. <Link to="/conditions-vente" target="_blank">Conditions générales de vente</Link></p>
    </div>
  );
}
