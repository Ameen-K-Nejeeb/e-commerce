// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Truck, Gem, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Value Propositions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-16 border-b border-stone-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Gem className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-serif font-bold text-sm tracking-wide">Certified Purity</h4>
              <p className="text-xs text-stone-400 mt-0.5">Hallmarked 24K gold and conflict-free gemstones.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-serif font-bold text-sm tracking-wide">Insured Logistics</h4>
              <p className="text-xs text-stone-400 mt-0.5">Fully secure, discreet, and tracked transit.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-serif font-bold text-sm tracking-wide">Master Artisans</h4>
              <p className="text-xs text-stone-400 mt-0.5">Direct creations from certified independent jewelers.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-16 border-b border-stone-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 flex items-center justify-center text-stone-900 font-serif font-black text-lg shadow-md">
                O
              </div>
              <span className="text-2xl font-serif tracking-wider font-extrabold text-white">
                Ornastyle
              </span>
            </div>
            <p className="text-xs text-stone-400 max-w-sm leading-relaxed font-medium">
              An exclusive multi-vendor atelier bridging legendary independent master jewelers with collectors of fine heritage ornaments.
            </p>
            <div className="pt-2 text-xs text-amber-500/80 font-mono tracking-widest uppercase">
              Established 2026 • Kerala, India
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-serif font-bold text-xs uppercase tracking-[0.2em] mb-4">Navigation</h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li><Link to="/" className="hover:text-amber-400 transition-colors">Collections</Link></li>
              <li><Link to="/about" className="hover:text-amber-400 transition-colors">Our Heritage</Link></li>
              <li><Link to="/orders" className="hover:text-amber-400 transition-colors">Track Acquisitions</Link></li>
              <li><Link to="/cart" className="hover:text-amber-400 transition-colors">Jewelry Bag</Link></li>
            </ul>
          </div>

          {/* Artisan Portal */}
          <div>
            <h4 className="text-white font-serif font-bold text-xs uppercase tracking-[0.2em] mb-4">Atelier</h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li><Link to="/register/vendor" className="hover:text-amber-400 transition-colors">Register as Artisan</Link></li>
              <li><Link to="/vendor/studio" className="hover:text-amber-400 transition-colors">Vendor Studio</Link></li>
              <li><a href="http://127.0.0.1:8000/admin/" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">System Admin</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-serif font-bold text-xs uppercase tracking-[0.2em] mb-4">Privé Club</h4>
            <p className="text-xs text-stone-400 mb-3 font-medium">Subscribe for early access to limited gold and gemstone drops.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully to Ornastyle Privé!'); }} className="space-y-2">
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 text-white placeholder-stone-500 rounded-xl text-xs outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm"
              >
                Join Privé
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 font-medium">
          <p>© 2026 Ornastyle Fine Jewelry. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-stone-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-stone-400 cursor-pointer">Terms of Authentication</span>
            <span className="hover:text-stone-400 cursor-pointer">Vault Security</span>
          </div>
        </div>

      </div>
    </footer>
  );
}