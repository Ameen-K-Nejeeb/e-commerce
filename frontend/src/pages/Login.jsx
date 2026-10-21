// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(email, password); navigate('/'); }
    catch (err) { setError(err.response?.data?.detail || 'Invalid email or password.'); }
    finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (cred) => {
    try { await googleLogin(cred.credential); navigate('/'); }
    catch (err) { setError('Google authentication failed.'); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#080808] py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-[#111111] p-8 sm:p-10 rounded-3xl border border-[#C9A96A]/30">
        <div className="text-center">
          <Sparkles className="w-8 h-8 text-[#C9A96A] mx-auto mb-3" />
          <h2 className="text-3xl font-serif font-extrabold text-[#F5E6D3]">Welcome Back</h2>
          <p className="mt-2 text-sm text-[#F5E6D3]/60">Sign in to access your wardrobe.</p>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center gap-3 text-red-400 text-sm font-medium">
            <AlertCircle className="w-5 h-5" /> <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#C9A96A] mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-2.5 text-[#C9A96A]/50" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none focus:border-[#C9A96A]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#C9A96A] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-2.5 text-[#C9A96A]/50" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none focus:border-[#C9A96A]" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 px-4 rounded-xl text-sm font-bold uppercase tracking-wider text-[#080808] bg-[#C9A96A] hover:bg-[#B38D46] transition-all disabled:opacity-50">
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {GOOGLE_CLIENT_ID && (
          <>
            <div className="relative my-7"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#C9A96A]/20" /></div><div className="relative flex justify-center text-xs font-bold uppercase tracking-widest"><span className="px-4 bg-[#111111] text-[#F5E6D3]/50">Or</span></div></div>
            <div className="flex justify-center"><GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Cancelled')} theme="filled_black" shape="pill" /></div>
          </>
        )}
        <p className="text-center text-sm text-[#F5E6D3]/50 mt-6">
          New to VELMORA? <Link to="/register" className="font-bold text-[#C9A96A] hover:text-[#B38D46]">Create an account</Link>
        </p>
      </div>
    </div>
  );
}