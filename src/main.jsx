import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { StoreProvider } from './context/StoreContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { ProductModalProvider } from './context/ProductModalContext.jsx';
import '@fontsource/bodoni-moda/400.css';
import '@fontsource/bodoni-moda/400-italic.css';
import '@fontsource/bodoni-moda/500.css';
import '@fontsource-variable/jost';
import './styles/tokens.css';
import './styles/base.css';
import './styles/main.css';
import './styles/commerce.css';

if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <CartProvider>
          <ProductModalProvider>
            <App />
          </ProductModalProvider>
        </CartProvider>
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>,
);
