import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { CartProvider } from './context/CartContext.jsx'
import axios from 'axios'

// Set the base URL for API requests. In production, this will point to the Render backend.
// In local development, the proxy in vite.config.js handles it, but setting it explicitly is safer.
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </StrictMode>,
)
