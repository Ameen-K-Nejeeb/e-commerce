// src/pages/About.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Gem, Award, ArrowRight } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900">
      
      {/* Hero Section */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-md mb-6">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-800">
            The Ornastyle Heritage
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6">
          Where Master Craftsmanship Meets <br />
          <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
            Uncompromising Luxury.
          </span>
        </h1>

        <p className="text-stone-600 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed mb-10">
          Ornastyle was born from a singular vision: to bridge the world’s finest independent master jewelers with discerning collectors who value authenticity, rarity, and breathtaking design.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-lg shadow-amber-600/20 transition-all hover:scale-105"
        >
          Explore Collections <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Editorial Split Section */}
      <section className="bg-white py-20 sm:py-28 border-y border-amber-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 leading-tight">
              Handcrafted Ornaments, Direct From the Atelier.
            </h2>
            <p className="text-stone-600 font-medium leading-relaxed">
              Unlike traditional retail models laden with middlemen, Ornastyle operates as a curated multi-vendor sanctuary. Every piece in our vault is published directly by certified independent artisans and historic family workshops.
            </p>
            <p className="text-stone-600 font-medium leading-relaxed">
              From certified conflict-free diamonds and 24K pure gold to rare gemstones, every creation undergoes rigorous authentication to ensure it meets the highest standards of fine jewelry excellence.
            </p>
          </div>

          <div className="relative aspect-video lg:aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl shadow-amber-900/10 border border-amber-100">
            <img
              src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000"
              alt="Fine Jewelry Craftsmanship"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* Pillars of Excellence */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl font-serif font-bold text-stone-900 mb-3">The Ornastyle Promise</h2>
          <p className="text-stone-500 text-sm font-medium">Built on transparency, security, and timeless beauty.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-amber-100/60 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Gem className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-900">Certified Purity</h3>
            <p className="text-stone-600 text-sm font-medium leading-relaxed">
              All precious metals and gemstones carry official hallmarks and independent grading certificates guaranteeing absolute authenticity.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-amber-100/60 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-900">Insured Logistics</h3>
            <p className="text-stone-600 text-sm font-medium leading-relaxed">
              Every acquisition is packaged in secure, discreet vaults and shipped via fully insured high-value couriers with real-time tracking.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-amber-100/60 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-900">Independent Artisans</h3>
            <p className="text-stone-600 text-sm font-medium leading-relaxed">
              By empowering independent master jewelers, we preserve legacy artistry while giving you access to truly unique, bespoke designs.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Call to Action */}
      <section className="bg-stone-900 text-white py-20 text-center relative overflow-hidden">
        <div className="relative max-w-3xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold">Begin Your Journey Into Fine Ornaments</h2>
          <p className="text-stone-400 text-sm font-medium max-w-lg mx-auto">
            Explore our curated vault or register your atelier to start publishing your masterworks.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link
              to="/"
              className="px-8 py-3.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white text-xs font-black uppercase tracking-widest rounded-full transition-all shadow-md"
            >
              View Catalog
            </Link>
            <Link
              to="/register/vendor"
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all"
            >
              Join as Artisan
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}