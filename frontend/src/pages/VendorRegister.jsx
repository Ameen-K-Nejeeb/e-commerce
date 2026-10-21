// src/pages/VendorRegister.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Store, AlertCircle } from 'lucide-react';

export default function VendorRegister() {
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', password: '', store_name: '', phone_number: '', address: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await api.post('auth/register/vendor/', formData);
      localStorage.setItem('access_token', res.data.access);
      window.location.href = '/vendor/studio';
    } catch (err) { setError('Failed to register boutique.'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#080808] py-12 px-4">
      <div className="max-w-xl w-full space-y-6 bg-[#111111] p-8 sm:p-10 rounded-3xl border border-[#C9A96A]/30">
        <div className="text-center">
          <Store className="w-8 h-8 text-[#C9A96A] mx-auto mb-4" />
          <h2 className="text-3xl font-serif font-extrabold text-[#F5E6D3]">Open Your Fashion House</h2>
          <p className="mt-2 text-sm text-[#F5E6D3]/60">Join VELMORA to showcase your designs to the world.</p>
        </div>
        
        {error && <div className="bg-red-900/30 text-red-400 p-4 border-l-4 border-red-500 rounded-r-xl">{error}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
           <div className="grid grid-cols-2 gap-4">
             <input type="text" name="first_name" required onChange={handleChange} placeholder="First Name" className="w-full p-2.5 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none" />
             <input type="text" name="last_name" onChange={handleChange} placeholder="Last Name" className="w-full p-2.5 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none" />
           </div>
           <input type="text" name="store_name" required onChange={handleChange} placeholder="Design House Name" className="w-full p-2.5 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none" />
           <input type="email" name="email" required onChange={handleChange} placeholder="Business Email" className="w-full p-2.5 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none" />
           <input type="password" name="password" required onChange={handleChange} placeholder="Password" className="w-full p-2.5 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none" />
           
           <button type="submit" disabled={loading} className="w-full py-3 text-sm font-bold uppercase bg-[#C9A96A] text-[#080808] rounded-xl mt-4">
             Establish Studio
           </button>
        </form>
      </div>
    </div>
  );
}