import { PAYMENT_METHODS } from '../payment/index.js';

/** Logos Wave et Orange Money, posés sur une plaque claire pour respecter leurs couleurs. */
export default function PaymentLogos({ size = 'small', className = '' }) {
  return (
    <ul className={`pay-logos pay-logos--${size} ${className}`} aria-label="Moyens de paiement acceptés">
      {PAYMENT_METHODS.map((m) => (
        <li key={m.id} className={`pay-logos__item pay-logos__item--${m.id}`}>
          <img src={m.logo.src} width={m.logo.width} height={m.logo.height} alt={m.name} loading="lazy" decoding="async" />
        </li>
      ))}
    </ul>
  );
}
