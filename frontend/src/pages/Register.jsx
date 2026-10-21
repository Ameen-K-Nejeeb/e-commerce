// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, AlertCircle, Store } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ email: '', password: '', confirm_password: '', first_name: '', last_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (formData.password !== formData.confirm_password) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try { await register({ ...formData, role: 'CUSTOMER' }); navigate('/'); }
    catch (err) { setError('Failed to create account.'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#080808] py-12 px-4">
      <div className="max-w-md w-full space-y-6 bg-[#111111] p-8 sm:p-10 rounded-3xl border border-[#C9A96A]/30">
        <div className="text-center">
          <h2 className="text-3xl font-serif font-extrabold text-[#F5E6D3]">Join VELMORA</h2>
          <p className="mt-2 text-sm text-[#F5E6D3]/60">Create an account to curate your fashion wardrobe.</p>
        </div>
        
        {error && <div className="bg-red-900/30 text-red-400 p-4 text-sm font-medium border-l-4 border-red-500 rounded-r-xl">{error}</div>}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="first_name" required onChange={handleChange} placeholder="First Name" className="w-full p-2.5 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none focus:border-[#C9A96A]" />
            <input type="text" name="last_name" onChange={handleChange} placeholder="Last Name" className="w-full p-2.5 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none focus:border-[#C9A96A]" />
          </div>
          <input type="email" name="email" required onChange={handleChange} placeholder="Email" className="w-full p-2.5 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none focus:border-[#C9A96A]" />
          <input type="password" name="password" required onChange={handleChange} placeholder="Password" className="w-full p-2.5 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none focus:border-[#C9A96A]" />
          <input type="password" name="confirm_password" required onChange={handleChange} placeholder="Confirm Password" className="w-full p-2.5 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none focus:border-[#C9A96A]" />
          
          <button type="submit" disabled={loading} className="w-full py-3 text-sm font-bold uppercase bg-[#C9A96A] text-[#080808] rounded-xl mt-4">
            Create Account
          </button>
        </form>

        <div className="pt-6 border-t border-[#C9A96A]/20 text-center">
          <Link to="/register/vendor" className="text-xs font-bold uppercase text-[#C9A96A] hover:text-[#B38D46] flex items-center justify-center gap-1.5">
            <Store className="w-4 h-4"/> Apply as a Designer
          </Link>
        </div>
      </div>
    </div>
  );
}