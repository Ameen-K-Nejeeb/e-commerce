// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  ShoppingCart,
  User as UserIcon,
  LogOut,
  Store,
  ShieldCheck,
  Package,
  Info,
} from "lucide-react";
import ProfileDrawer from "../pages/ProfileDrawer";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const isVendor = user?.role === "VENDOR";

  return (
    <>
      <header className="bg-[#080808]/95 backdrop-blur-md border-b border-[#C9A96A]/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo - VELMORA */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-[#C9A96A] flex items-center justify-center text-[#080808] font-serif font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              V
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-serif tracking-wider font-extrabold text-[#F5E6D3]">
                VELMORA
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#C9A96A] font-semibold -mt-1">
                Modern Luxury
              </span>
            </div>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide text-[#F5E6D3]/80">
            <Link
              to="/"
              className="hover:text-[#C9A96A] transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-[#C9A96A] after:transition-all"
            >
              Collections
            </Link>

            <Link
              to="/about"
              className="hover:text-[#C9A96A] transition-colors flex items-center gap-1.5 py-1"
            >
              <Info className="w-4 h-4 text-[#C9A96A]" />
              About
            </Link>

            {user && !isVendor && (
              <Link
                to="/orders"
                className="hover:text-[#C9A96A] transition-colors flex items-center gap-1.5 py-1"
              >
                <Package className="w-4 h-4 text-[#C9A96A]" />
                My Wardrobe
              </Link>
            )}

            {isVendor && (
              <Link
                to="/vendor/studio"
                className="text-[#080808] hover:text-[#080808] font-semibold flex items-center gap-1.5 px-3 py-1 bg-[#C9A96A] rounded-full"
              >
                <Store className="w-4 h-4" />
                Boutique Studio
              </Link>
            )}

            {user?.role === "ADMIN" && (
              <Link
                to="/admin/dashboard"
                className="text-[#080808] font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 px-4 py-2 bg-[#C9A96A] hover:bg-[#B38D46] rounded-full transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                Master Control
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {!isVendor && (
              <Link
                to="/cart"
                className="relative p-2.5 rounded-full text-[#F5E6D3]/80 hover:text-[#C9A96A] hover:bg-[#111111] transition-all"
                title="Shopping Bag"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 bg-[#C9A96A] text-[#080808] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setProfileDrawerOpen(true)}
                  className="flex items-center gap-3 p-1.5 rounded-full sm:rounded-2xl hover:bg-[#111111] transition-all group text-left cursor-pointer border border-transparent hover:border-[#C9A96A]/30"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-[#F5E6D3] group-hover:text-[#C9A96A] transition-colors">
                      {user.first_name || user.email.split("@")[0]}
                    </p>
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border bg-[#111111] text-[#C9A96A] border-[#C9A96A]/30">
                      {user.role}
                    </span>
                  </div>

                  {user.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#C9A96A] shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#111111] border border-[#C9A96A] flex items-center justify-center text-[#C9A96A] shadow-sm">
                      <UserIcon className="w-5 h-5" />
                    </div>
                  )}
                </button>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-[#F5E6D3]/50 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs uppercase tracking-wider font-semibold text-[#F5E6D3] hover:text-[#C9A96A] px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs uppercase tracking-wider font-bold text-[#080808] bg-[#C9A96A] hover:bg-[#B38D46] px-5 py-2.5 rounded-full transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      <ProfileDrawer
        isOpen={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
      />
    </>
  );
}
