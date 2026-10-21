// src/pages/HelloBanner.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function HeroBanner() {
  return (
    <div className="relative w-full h-[450px] sm:h-[500px] lg:h-[550px] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/50 border border-[#C9A96A]/30 group mt-4 mb-12">
      <div className="absolute inset-0 overflow-hidden bg-[#080808]">
        {/* Cinematic Fashion Image */}
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070" 
          alt="Cinematic Fashion"
          className="w-full h-full object-cover object-top opacity-60 group-hover:scale-105 transition-transform duration-[20s] ease-out"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/95 via-[#080808]/60 to-transparent" />

      <div className="relative h-full flex flex-col justify-center px-8 sm:px-12 lg:px-20 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#C9A96A]/40 bg-[#C9A96A]/10 backdrop-blur-md w-fit mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#C9A96A]" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C9A96A]">
            The FW 2026 Collection
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black text-[#F5E6D3] leading-[1.1] tracking-tight mb-5">
          Modern Luxury, <br />
          <span className="text-[#C9A96A]">
            Redefined.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-[#F5E6D3]/70 font-medium max-w-lg mb-10 leading-relaxed">
          Discover exclusive designer apparel, iconic handbags, and statement footwear directly from independent fashion houses.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
            className="px-8 py-3.5 bg-[#C9A96A] hover:bg-[#B38D46] text-[#080808] text-xs font-black uppercase tracking-widest rounded-full transition-all flex items-center gap-2 hover:gap-3"
          >
            Explore Runway <ArrowRight className="w-4 h-4" />
          </button>
          
          <Link 
            to="/register/vendor"
            className="px-8 py-3.5 bg-[#111111]/80 hover:bg-[#111111] backdrop-blur-md border border-[#C9A96A]/40 text-[#C9A96A] text-xs font-bold uppercase tracking-widest rounded-full transition-all"
          >
            Join as Designer
          </Link>
        </div>
      </div>
    </div>
  );
}