// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User as UserIcon, LogOut, Store, ShieldCheck, Package, Sparkles } from 'lucide-react';
import ProfileDrawer from '../pages/ProfileDrawer';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const isVendor = user?.role === 'VENDOR';

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-amber-100/80 sticky top-0 z-50 shadow-[0_2px_15px_-3px_rgba(217,119,6,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo - Ornastyle */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 flex items-center justify-center text-white font-serif font-black text-xl shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              O
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-serif tracking-wider font-extrabold bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-800 bg-clip-text text-transparent">
                Ornastyle
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-amber-800/70 font-semibold -mt-1">
                Fine Jewelry & Luxury
              </span>
            </div>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide text-neutral-600">
            <Link 
              to="/" 
              className="hover:text-amber-700 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-amber-500 after:transition-all"
            >
              Collections
            </Link>

            {/* User Orders Link: Customers Only */}
            {user && !isVendor && (
              <Link 
                to="/orders" 
                className="hover:text-amber-700 transition-colors flex items-center gap-1.5 py-1"
              >
                <Package className="w-4 h-4 text-amber-600" />
                My Orders
              </Link>
            )}

            {/* Vendor Studio Link: Vendors Only */}
            {isVendor && (
              <Link 
                to="/vendor/studio" 
                className="text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full border border-amber-200"
              >
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
                className="text-stone-700 hover:text-stone-900 font-semibold flex items-center gap-1.5 px-3 py-1 bg-stone-100 rounded-full border border-stone-200"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
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
                className="relative p-2.5 rounded-full text-neutral-700 hover:text-amber-700 hover:bg-amber-50/60 transition-all"
                title="Jewelry Bag"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 bg-gradient-to-r from-amber-600 to-yellow-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                {/* Clickable User Target */}
                <button
                  type="button"
                  onClick={() => setProfileDrawerOpen(true)}
                  className="flex items-center gap-3 p-1.5 rounded-full sm:rounded-2xl hover:bg-amber-50/70 transition-all group text-left cursor-pointer border border-transparent hover:border-amber-200/60"
                  title="View Profile"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-neutral-800 group-hover:text-amber-800 transition-colors">
                      {user.first_name || user.email.split('@')[0]}
                    </p>
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                      user.role === 'ADMIN' ? 'bg-stone-100 text-stone-800 border-stone-200' :
                      user.role === 'VENDOR' ? 'bg-amber-100/70 text-amber-900 border-amber-300' :
                      'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {user.role}
                    </span>
                  </div>

                  {user.profile_picture ? (
                    <img 
                      src={user.profile_picture} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full object-cover border-2 border-amber-300 group-hover:border-amber-500 transition-colors shadow-sm" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-amber-100/60 border border-amber-300 flex items-center justify-center text-amber-800 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-sm">
                      <UserIcon className="w-5 h-5" />
                    </div>
                  )}
                </button>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-neutral-400 hover:text-rose-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="text-xs uppercase tracking-wider font-semibold text-neutral-700 hover:text-amber-700 px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="text-xs uppercase tracking-wider font-bold text-white bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 px-5 py-2.5 rounded-full shadow-md shadow-amber-500/15 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Slide-over Profile Drawer */}
      <ProfileDrawer 
        isOpen={profileDrawerOpen} 
        onClose={() => setProfileDrawerOpen(false)} 
      />
    </>
  );
}