// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Truck, Crown, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#080808] text-[#F5E6D3]/70 pt-16 pb-12 border-t border-[#C9A96A]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Value Propositions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-16 border-b border-[#C9A96A]/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C9A96A]/10 border border-[#C9A96A]/20 flex items-center justify-center text-[#C9A96A] flex-shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-[#C9A96A] font-serif font-bold text-sm tracking-wide">Authentic Craftsmanship</h4>
              <p className="text-xs text-[#F5E6D3]/50 mt-0.5">Premium fabrics and Italian leather.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C9A96A]/10 border border-[#C9A96A]/20 flex items-center justify-center text-[#C9A96A] flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-[#C9A96A] font-serif font-bold text-sm tracking-wide">White-Glove Delivery</h4>
              <p className="text-xs text-[#F5E6D3]/50 mt-0.5">Fully secure, discreet, and tracked transit.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C9A96A]/10 border border-[#C9A96A]/20 flex items-center justify-center text-[#C9A96A] flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-[#C9A96A] font-serif font-bold text-sm tracking-wide">Master Designers</h4>
              <p className="text-xs text-[#F5E6D3]/50 mt-0.5">Direct creations from certified fashion houses.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-16 border-b border-[#C9A96A]/10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#C9A96A] flex items-center justify-center text-[#080808] font-serif font-black text-lg shadow-md">
                V
              </div>
              <span className="text-2xl font-serif tracking-wider font-extrabold text-[#F5E6D3]">
                VELMORA
              </span>
            </div>
            <p className="text-xs text-[#F5E6D3]/50 max-w-sm leading-relaxed font-medium">
              An exclusive multi-vendor atelier bridging legendary independent fashion designers with collectors of modern luxury.
            </p>
            <div className="pt-2 text-xs text-[#C9A96A]/80 font-mono tracking-widest uppercase">
              Established 2026 • Velvet-Inspired Luxury
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[#C9A96A] font-serif font-bold text-xs uppercase tracking-[0.2em] mb-4">Navigation</h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li><Link to="/" className="hover:text-[#C9A96A] transition-colors">Runway</Link></li>
              <li><Link to="/about" className="hover:text-[#C9A96A] transition-colors">Our Heritage</Link></li>
              <li><Link to="/orders" className="hover:text-[#C9A96A] transition-colors">Track Orders</Link></li>
              <li><Link to="/cart" className="hover:text-[#C9A96A] transition-colors">Shopping Bag</Link></li>
            </ul>
          </div>

          {/* Artisan Portal */}
          <div>
            <h4 className="text-[#C9A96A] font-serif font-bold text-xs uppercase tracking-[0.2em] mb-4">Design House</h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li><Link to="/register/vendor" className="hover:text-[#C9A96A] transition-colors">Register as Designer</Link></li>
              <li><Link to="/vendor/studio" className="hover:text-[#C9A96A] transition-colors">Boutique Studio</Link></li>
              <li><a href="http://127.0.0.1:8000/admin/" target="_blank" rel="noreferrer" className="hover:text-[#C9A96A] transition-colors">System Admin</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[#C9A96A] font-serif font-bold text-xs uppercase tracking-[0.2em] mb-4">Velmora Privé</h4>
            <p className="text-xs text-[#F5E6D3]/50 mb-3 font-medium">Subscribe for early access to limited seasonal drops.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully to Velmora Privé!'); }} className="space-y-2">
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="w-full px-3.5 py-2.5 bg-[#111111] border border-[#C9A96A]/30 text-[#F5E6D3] placeholder-[#F5E6D3]/30 rounded-xl text-xs outline-none focus:border-[#C9A96A] transition-colors"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-[#C9A96A] hover:bg-[#B38D46] text-[#080808] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm"
              >
                Join Privé
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F5E6D3]/40 font-medium">
          <p>© 2026 Velmora Modern Fashion. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#C9A96A] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#C9A96A] cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#C9A96A] cursor-pointer">Client Care</span>
          </div>
        </div>

      </div>
    </footer>
  );
}