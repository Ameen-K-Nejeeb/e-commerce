// src/pages/About.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Crown, Shirt, ArrowRight } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#F5E6D3]">
      
      {/* Hero Section */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#C9A96A]/30 bg-[#C9A96A]/10 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#C9A96A]" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C9A96A]">
            The Velmora Heritage
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6 text-[#F5E6D3]">
          Where Avant-Garde Design Meets <br />
          <span className="text-[#C9A96A]">
            Uncompromising Luxury.
          </span>
        </h1>

        <p className="text-[#F5E6D3]/70 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed mb-10">
          VELMORA was born from a singular vision: to bridge the world’s most sought-after independent fashion designers with discerning individuals who value authenticity, modern aesthetics, and breathtaking style.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#C9A96A] hover:bg-[#B38D46] text-[#080808] text-xs font-black uppercase tracking-widest rounded-full transition-all hover:scale-105"
        >
          Explore the Runway <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Editorial Split Section */}
      <section className="bg-[#111111] py-20 sm:py-28 border-y border-[#C9A96A]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#C9A96A] leading-tight">
              Curated Masterpieces, Direct From the Fashion House.
            </h2>
            <p className="text-[#F5E6D3]/80 font-medium leading-relaxed">
              Unlike traditional retail models laden with middlemen, VELMORA operates as an exclusive multi-vendor sanctuary. Every garment and accessory in our collection is published directly by certified independent designers and historic fashion houses.
            </p>
            <p className="text-[#F5E6D3]/80 font-medium leading-relaxed">
              From premium Italian leathers and sustainable silks to hand-stitched detailing, every creation undergoes rigorous authentication to ensure it meets the highest standards of luxury fashion.
            </p>
          </div>

          <div className="relative aspect-video lg:aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl border border-[#C9A96A]/30">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000"
              alt="Luxury Fashion Craftsmanship"
              className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </div>
      </section>

      {/* Pillars of Excellence */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl font-serif font-bold text-[#C9A96A] mb-3">The Velmora Standard</h2>
          <p className="text-[#F5E6D3]/60 text-sm font-medium">Built on exclusivity, quality, and timeless elegance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#111111] p-8 rounded-3xl border border-[#C9A96A]/20 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C9A96A]/10 border border-[#C9A96A]/30 flex items-center justify-center text-[#C9A96A]">
              <Crown className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#C9A96A]">Premium Materials</h3>
            <p className="text-[#F5E6D3]/70 text-sm font-medium leading-relaxed">
              We ensure all fabrics, leathers, and hardware carry the mark of true luxury, sourced responsibly and crafted meticulously.
            </p>
          </div>

          <div className="bg-[#111111] p-8 rounded-3xl border border-[#C9A96A]/20 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C9A96A]/10 border border-[#C9A96A]/30 flex items-center justify-center text-[#C9A96A]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#C9A96A]">White-Glove Delivery</h3>
            <p className="text-[#F5E6D3]/70 text-sm font-medium leading-relaxed">
              Every acquisition is packaged in signature boxes and shipped via fully insured couriers to ensure pristine condition upon arrival.
            </p>
          </div>

          <div className="bg-[#111111] p-8 rounded-3xl border border-[#C9A96A]/20 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C9A96A]/10 border border-[#C9A96A]/30 flex items-center justify-center text-[#C9A96A]">
              <Shirt className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#C9A96A]">Independent Designers</h3>
            <p className="text-[#F5E6D3]/70 text-sm font-medium leading-relaxed">
              By empowering independent couturiers and designers, we give you access to truly unique, avant-garde styles not found elsewhere.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}