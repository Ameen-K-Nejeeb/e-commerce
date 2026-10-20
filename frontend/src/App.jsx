// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import VendorRegister from './pages/VendorRegister';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import VendorStudio from './pages/VendorStudio';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Marketplace Views */}
          <Route path="/" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/vendor" element={<VendorRegister />} />

          {/* Customer Authenticated Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/orders" element={<Orders />} />
          </Route>

          {/* Vendor Studio Protected Route */}
          <Route element={<ProtectedRoute allowedRoles={['VENDOR', 'ADMIN']} />}>
            <Route path="/vendor/studio" element={<VendorStudio />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}