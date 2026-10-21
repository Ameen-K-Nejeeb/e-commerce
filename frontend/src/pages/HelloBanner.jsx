import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function HeroBanner() {
  return (
    <div className="relative w-full h-[450px] sm:h-[500px] lg:h-[550px] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-amber-900/10 border border-amber-100/50 group mt-4 mb-12">
      {/* Background Image with Parallax-like zoom on hover */}
      <div className="absolute inset-0 overflow-hidden bg-stone-900">
        <img
          src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070" 
          alt="Luxury Gold Jewelry"
          className="w-full h-full object-cover object-center opacity-70 group-hover:scale-105 transition-transform duration-[20s] ease-out"
        />
      </div>

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 via-stone-900/60 to-transparent" />

      {/* Content Container */}
      <div className="relative h-full flex flex-col justify-center px-8 sm:px-12 lg:px-20 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-md w-fit mb-6">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200">
            The 2026 Heritage Collection
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black text-white leading-[1.1] tracking-tight mb-5">
          Timeless Elegance, <br />
          <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-600 bg-clip-text text-transparent">
            Forged in Gold.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-stone-300 font-medium max-w-lg mb-10 leading-relaxed">
          Discover exquisite, handcrafted ornaments and precious gemstones directly from certified independent master jewelers around the world.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
            className="px-8 py-3.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white text-xs font-black uppercase tracking-widest rounded-full transition-all shadow-lg shadow-amber-600/30 flex items-center gap-2 hover:gap-3"
          >
            Explore Collection <ArrowRight className="w-4 h-4" />
          </button>
          
          <Link 
            to="/register/vendor"
            className="px-8 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all"
          >
            Become an Artisan
          </Link>
        </div>
      </div>
    </div>
  );
}