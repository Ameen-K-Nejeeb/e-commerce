// src/pages/VendorRegister.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Store, Mail, Lock, Phone, MapPin, Building, AlertCircle } from 'lucide-react';

export default function VendorRegister() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    store_name: '',
    phone_number: '',
    address: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('auth/register/vendor/', formData);
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = '/vendor/studio';
    } catch (err) {
      const errData = err.response?.data;
      if (typeof errData === 'object' && errData !== null) {
        const firstKey = Object.keys(errData)[0];
        const msg = Array.isArray(errData[firstKey]) ? errData[firstKey][0] : errData[firstKey];
        setError(`${firstKey}: ${msg}`);
      } else {
        setError('Failed to complete artisan registration.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#faf8f5]/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-amber-900/5 border border-amber-100/60">
        <div className="text-center">
          <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-amber-100 to-amber-50 text-amber-700 border border-amber-200 mb-4 shadow-sm">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-serif font-extrabold text-stone-900">Open Your Atelier</h2>
          <p className="mt-2 text-sm text-stone-500 font-medium px-4">
            Join Ornastyle to showcase your fine jewelry to a world of discerning collectors.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl flex items-center gap-3 text-rose-800 text-sm font-medium">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Owner Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">First Name</label>
              <input
                type="text"
                name="first_name"
                required
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Master"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Jeweler"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all"
              />
            </div>
          </div>

          {/* Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Business Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="atelier@brand.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 8 chars"
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Store Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Atelier Name</label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                <input
                  type="text"
                  name="store_name"
                  required
                  value={formData.store_name}
                  onChange={handleChange}
                  placeholder="e.g. Royal Gems"
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Direct Line</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                <input
                  type="text"
                  name="phone_number"
                  required
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Boutique Address</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="Building, Street, City, State, PIN"
                className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Atelier Description</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell collectors about your heritage and craftsmanship..."
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl text-white text-sm uppercase tracking-widest font-extrabold bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-600 hover:from-amber-800 hover:to-yellow-700 shadow-md shadow-amber-700/20 transition-all disabled:opacity-50 hover:scale-[1.02] mt-4"
          >
            {loading ? 'Submitting Application...' : 'Establish Artisan Studio'}
          </button>
        </form>

        <p className="text-center text-xs font-medium text-stone-500 pt-4">
          Already an approved artisan?{' '}
          <Link to="/login" className="font-bold text-amber-700 hover:text-amber-800 uppercase tracking-wider">
            Sign In to Studio
          </Link>
        </p>
      </div>
    </div>
  );
}