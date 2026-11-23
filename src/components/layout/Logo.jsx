import { useStore } from '../../context/StoreContext.jsx';

/**
 * Logo officiel de la marque (public/images/brand/, fond transparent), une version par thème :
 * - variant « nom » (en-tête, menu) : le nom manuscrit seul ; version claire ou sombre selon le thème ;
 * - variant « complet » (pied de page, toujours sur bandeau sombre) : silhouette et nom.
 */
const NOM = { width: 593, height: 96 };

export default function Logo({ variant = 'nom', className = '' }) {
  const { settings } = useStore();
  const alt = settings.shop.name;
  if (variant === 'complet') {
    return <img className={`logo logo--complet ${className}`} src="/images/brand/logo-sombre.png" width="633" height="506" alt={alt} decoding="async" />;
  }
  return (
    <>
      <img className={`logo logo--nom on-light-theme ${className}`} src="/images/brand/nom-clair.png" {...NOM} alt={alt} decoding="async" />
      <img className={`logo logo--nom on-dark-theme ${className}`} src="/images/brand/nom-sombre.png" {...NOM} alt={alt} decoding="async" />
    </>
  );
}
