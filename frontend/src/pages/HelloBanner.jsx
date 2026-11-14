// src/pages/HeroBanner.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070", // High-end Cinematic Fashion Shot
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2070", // Atmospheric Runway Showcase
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070"  // Premium Outdoor Designer Apparel
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 4500); // Transitions to another high-end background view every few seconds for visual dynamism

    return () => clearInterval(slideInterval);
  }, []);

  return (
    <div className="relative w-full h-[480px] sm:h-[520px] lg:h-[580px] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/60 border border-[#C9A96A]/30 group mt-4 mb-12">
      {/* Background Slider Section */}
      <div className="absolute inset-0 bg-[#080808] z-0">
        {BACKGROUND_IMAGES.map((imgUrl, index) => (
          <div
            key={imgUrl}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-45 scale-100" : "opacity-0 scale-105"
            } transform transition-transform duration-[4500ms]`}
          >
            <img
              src={imgUrl}
              alt={`Cinematic Runway Scene ${index + 1}`}
              className="w-full h-full object-cover object-center"
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
        {/* Luxury Vignette and Linear Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/85 to-[#080808]/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/40 via-transparent to-transparent" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 h-full flex flex-col justify-center px-8 sm:px-12 lg:px-20 max-w-4xl">
        {/* Campaign Label Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C9A96A]/40 bg-[#C9A96A]/10 backdrop-blur-md w-fit mb-6 transition-all duration-300 hover:border-[#C9A96A]/70">
          <Sparkles className="w-3.5 h-3.5 text-[#C9A96A] animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C9A96A]">
            The FW 2026 Collection
          </span>
        </div>

        {/* Dynamic typography presenting: THE WILD ARCHIVE */}
        <span className="text-sm font-sans tracking-[0.3em] font-extrabold uppercase text-[#C9A96A] mb-1">
          The Wild Archive
        </span>

        {/* Title featuring a refined luxury styling */}
        <h1 className="text-4xl sm:text-5xl lg:text-6.5xl font-serif font-black text-[#F5E6D3] leading-[1.1] tracking-tight mb-5 max-w-2xl">
          Modern Luxury, <br />
          <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#C9A96A] via-[#E6C687] to-[#C9A96A]">
            Redefined.
          </span>
        </h1>

        {/* Brand description / subheading text */}
        <p className="text-sm sm:text-base text-[#F5E6D3]/70 font-medium max-w-xl mb-10 leading-relaxed font-sans">
          Discover exclusive designer apparel, iconic handbags, and statement footwear directly from independent fashion houses.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
            className="px-8 py-3.5 bg-[#C9A96A] hover:bg-[#B38D46] hover:scale-[1.02] active:scale-[0.98] text-[#080808] text-xs font-black uppercase tracking-widest rounded-full transition-all duration-300 flex items-center gap-2 hover:gap-3 shadow-lg shadow-[#C9A96A]/10"
          >
            Explore Runway <ArrowRight className="w-4 h-4" />
          </button>
          
          <Link 
            to="/register/vendor"
            className="px-8 py-3.5 bg-[#111111]/80 hover:bg-[#111111] hover:scale-[1.02] active:scale-[0.98] backdrop-blur-md border border-[#C9A96A]/30 hover:border-[#C9A96A]/60 text-[#C9A96A] text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300"
          >
            Join as Designer
          </Link>
        </div>
      </div>
    </div>
  );
}