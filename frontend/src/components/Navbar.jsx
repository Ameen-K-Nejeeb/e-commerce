// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User as UserIcon, LogOut, Store, ShieldCheck, Package } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const isVendor = user?.role === 'VENDOR';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            M
          </div>
          <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            MarketPulse
          </span>
        </Link>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-indigo-600 transition-colors">
            All Products
          </Link>

          {/* User Orders Link: Customers Only */}
          {user && !isVendor && (
            <Link to="/orders" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <Package className="w-4 h-4" />
              My Orders
            </Link>
          )}

          {/* Vendor Studio Link: Vendors Only */}
          {isVendor && (
            <Link to="/vendor/studio" className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1.5">
              <Store className="w-4 h-4" />
              Vendor Studio
            </Link>
          )}

          {/* Admin Portal Link: Admins Only */}
          {user?.role === 'ADMIN' && (
            <a 
              href="http://127.0.0.1:8000/admin/" 
              target="_blank" 
              rel="noreferrer"
              className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              Django Admin
            </a>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          
          {/* Cart Icon: HIDDEN FOR VENDORS */}
          {!isVendor && (
            <Link 
              to="/cart" 
              className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 leading-tight">
                  {user.first_name || user.email.split('@')[0]}
                </p>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  user.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' :
                  user.role === 'VENDOR' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-indigo-100 text-indigo-800'
                }`}>
                  {user.role}
                </span>
              </div>

              {user.profile_picture ? (
                <img 
                  src={user.profile_picture} 
                  alt="Profile" 
                  className="w-9 h-9 rounded-full object-cover border border-gray-200" 
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600">
                  <UserIcon className="w-5 h-5" />
                </div>
              )}

              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 text-gray-400 hover:text-rose-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                to="/login" 
                className="text-sm font-semibold text-gray-700 hover:text-indigo-600 px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl shadow-sm transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}