// src/pages/ProfileDrawer.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { X, User, Mail, Phone, MapPin, Building, Save, CheckCircle2, AlertCircle, Loader2, Shield, Sparkles } from "lucide-react";

export default function ProfileDrawer({ isOpen, onClose }) {
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({ 
    first_name: "", 
    last_name: "", 
    email: "", 
    phone_number: "", 
    address: "", 
    city_district: "", 
    state: "", 
    pincode: "" 
  });
  
  const [loading, setLoading] = useState(false); 
  const [saving, setSaving] = useState(false); 
  const [feedback, setFeedback] = useState({ error: "", success: "" });
  
  useEffect(() => { 
    if (isOpen) { 
      fetchLatestProfile(); 
      setFeedback({ error: "", success: "" }); 
    } 
  }, [isOpen]);

  const fetchLatestProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('auth/profile/');
      setFormData({
        first_name: res.data.first_name || user?.first_name || "",
        last_name: res.data.last_name || user?.last_name || "",
        email: res.data.email || user?.email || "",
        phone_number: res.data.phone_number || "",
        address: res.data.address || "",
        city_district: res.data.city_district || "",
        state: res.data.state || "",
        pincode: res.data.pincode || ""
      });
    } catch (err) {
      setFeedback({ error: "Failed to load secure profile data.", success: "" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ error: "", success: "" });
    
    try {
      await api.patch('auth/profile/', formData);
      
      // Update global context if name changed
      if (updateUser && user) {
        updateUser({ ...user, first_name: formData.first_name, last_name: formData.last_name });
      }
      
      setFeedback({ success: "Vault updated successfully. Ready for seamless checkout.", error: "" });
      
      // Auto-close drawer after 1.5 seconds so the Cart can detect the update
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      setFeedback({ error: err.response?.data?.error || "Failed to update profile.", success: "" });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      <div onClick={onClose} className="fixed inset-0 bg-[#080808]/80 backdrop-blur-sm transition-opacity" />
      
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#080808] shadow-2xl flex flex-col justify-between border-l border-[#C9A96A]/30 transform transition-transform duration-300">
          
          {/* Header */}
          <div className="p-5 border-b border-[#C9A96A]/20 flex items-center justify-between bg-[#111111]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C9A96A]/10 border border-[#C9A96A] flex items-center justify-center text-[#C9A96A]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-serif font-black text-[#F5E6D3]">Client Profile</h2>
                <p className="text-[9px] uppercase tracking-widest text-[#F5E6D3]/50">Manage your secure identity</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-[#F5E6D3]/50 hover:text-[#C9A96A] transition-colors rounded-full hover:bg-[#C9A96A]/10">
              <X className="w-5 h-5"/>
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 overflow-y-auto flex-1 scrollbar-none">
            
            {/* Feedback Messages */}
            {feedback.error && (
              <div className="mb-6 flex items-center gap-2 text-xs font-bold text-red-400 bg-red-950/30 p-3 rounded-xl border border-red-500/30">
                <AlertCircle className="w-4 h-4" /> {feedback.error}
              </div>
            )}
            {feedback.success && (
              <div className="mb-6 flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" /> {feedback.success}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3 text-[#C9A96A]">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-[10px] uppercase tracking-widest font-bold">Decrypting Vault...</span>
              </div>
            ) : (
              <form onSubmit={handleSave} id="profile-edit-form" className="space-y-6">
                
                {/* Identity & Contact Section */}
                <div className="bg-[#111111] p-5 rounded-3xl border border-[#C9A96A]/20 space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A96A] flex gap-1.5 items-center">
                    <Shield className="w-3.5 h-3.5"/> Identity & Contact
                  </span>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-[#F5E6D3]/50 mb-1.5 block px-1">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A96A]/50" />
                        <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full py-2.5 pl-10 pr-3 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] text-sm rounded-xl outline-none focus:border-[#C9A96A] transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-[#F5E6D3]/50 mb-1.5 block px-1">Last Name</label>
                      <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full p-2.5 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] text-sm rounded-xl outline-none focus:border-[#C9A96A] transition-colors" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-[#F5E6D3]/50 mb-1.5 block px-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A96A]/50" />
                      <input type="email" name="email" value={formData.email} readOnly className="w-full py-2.5 pl-10 pr-3 bg-[#080808] border border-[#C9A96A]/10 text-[#F5E6D3]/50 text-sm rounded-xl outline-none cursor-not-allowed" title="Email cannot be changed" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-[#F5E6D3]/50 mb-1.5 block px-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A96A]/50" />
                      <input type="text" name="phone_number" placeholder="10-digit number" value={formData.phone_number} onChange={handleChange} className="w-full py-2.5 pl-10 pr-3 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] text-sm rounded-xl outline-none focus:border-[#C9A96A] transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Delivery Destination Section */}
                <div className="bg-[#111111] p-5 rounded-3xl border border-[#C9A96A]/20 space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A96A] flex gap-1.5 items-center">
                    <MapPin className="w-3.5 h-3.5"/> Default Delivery Destination
                  </span>
                  
                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-[#F5E6D3]/50 mb-1.5 block px-1">Street Address</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 w-4 h-4 text-[#C9A96A]/50" />
                      <textarea name="address" placeholder="Suite, Building, Street..." value={formData.address} onChange={handleChange} rows="2" className="w-full py-2.5 pl-10 pr-3 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] text-sm rounded-xl outline-none focus:border-[#C9A96A] transition-colors resize-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-[#F5E6D3]/50 mb-1.5 block px-1">City / District</label>
                      <input type="text" name="city_district" value={formData.city_district} onChange={handleChange} className="w-full p-2.5 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] text-sm rounded-xl outline-none focus:border-[#C9A96A] transition-colors" />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-[#F5E6D3]/50 mb-1.5 block px-1">State</label>
                      <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full p-2.5 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] text-sm rounded-xl outline-none focus:border-[#C9A96A] transition-colors" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-[#F5E6D3]/50 mb-1.5 block px-1">Postal Code</label>
                    <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full p-2.5 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] text-sm font-mono tracking-widest rounded-xl outline-none focus:border-[#C9A96A] transition-colors" />
                  </div>
                </div>

              </form>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-[#C9A96A]/20 flex justify-end gap-3 bg-[#111111]">
            <button type="button" onClick={onClose} disabled={saving} className="px-5 py-2.5 text-[#F5E6D3]/60 uppercase text-xs font-bold hover:text-[#F5E6D3] transition-colors">
              Cancel
            </button>
            <button form="profile-edit-form" type="submit" disabled={saving || loading} className="px-6 py-2.5 bg-[#C9A96A] hover:bg-[#B38D46] text-[#080808] rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Updating...' : 'Update Vault'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}