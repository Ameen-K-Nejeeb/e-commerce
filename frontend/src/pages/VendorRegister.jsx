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
        setError('Failed to complete vendor registration.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-50 text-emerald-600 mb-3">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Open Your Vendor Store</h2>
          <p className="mt-2 text-sm text-gray-500">
            List shoes, clothes, watches, electronics, and manage your inventory with our marketplace.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Owner Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">First Name</label>
              <input
                type="text"
                name="first_name"
                required
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Ameen"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Nejeeb"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Business Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="vendor@mystore.com"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 8 characters"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Store Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Store Name</label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  name="store_name"
                  required
                  value={formData.store_name}
                  onChange={handleChange}
                  placeholder="e.g. Apex Footwear Hub"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  name="phone_number"
                  required
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Warehouse / Store Address</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="Building, Street, City, State, PIN"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Store Description</label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell customers what products your store specializes in..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl text-white font-bold bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? 'Submitting Application...' : 'Register Store & Open Studio'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500">
          Already registered as a vendor?{' '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Sign In to Vendor Studio
          </Link>
        </p>
      </div>
    </div>
  );
}