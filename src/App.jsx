import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import NotFound from './pages/NotFound.jsx';
import { Contact, Faq } from './pages/Info.jsx';
import { BlogIndex, BlogPost } from './pages/Blog.jsx';
import { MentionsLegales, Confidentialite, ConditionsUtilisation, ConditionsVente, LivraisonRetours } from './pages/legal/Legal.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="boutique" element={<Shop />} />
        <Route path="collections" element={<Navigate to="/boutique" replace />} />
        <Route path="collections/:slug" element={<CollectionRedirect />} />
        <Route path="blog" element={<BlogIndex />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="contact" element={<Contact />} />
        <Route path="faq" element={<Faq />} />
        <Route path="livraison-retours" element={<LivraisonRetours />} />
        <Route path="conditions-utilisation" element={<ConditionsUtilisation />} />
        <Route path="conditions-vente" element={<ConditionsVente />} />
        <Route path="confidentialite" element={<Confidentialite />} />
        <Route path="mentions-legales" element={<MentionsLegales />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

/** Anciennes pages de collection : la boutique filtrée les remplace. */
function CollectionRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/boutique?collection=${encodeURIComponent(slug)}`} replace />;
}
