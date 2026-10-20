// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import App from './App';
import './index.css';

// Read from Vite environment variable (or empty string fallback)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const RootApp = (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {GOOGLE_CLIENT_ID ? (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        {RootApp}
      </GoogleOAuthProvider>
    ) : (
      RootApp
    )}
  </React.StrictMode>
);