// src/pages/ProfileDrawer.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  X, User, Mail, Phone, MapPin, Building, Save, CheckCircle2, AlertCircle, Loader2, Shield, Sparkles
} from "lucide-react";

export default function ProfileDrawer({ isOpen, onClose }) {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    first_name: "", last_name: "", email: "", phone_number: "", address: "", city_district: "", state: "", pincode: "",
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
      const res = await api.get("auth/profile/");
      setFormData({
        first_name: res.data.first_name || "", last_name: res.data.last_name || "", email: res.data.email || "", phone_number: res.data.phone_number || "", address: res.data.address || "", city_district: res.data.city_district || "", state: res.data.state || "", pincode: res.data.pincode || "",
      });
    } catch (err) {
      if (user) {
        setFormData(prev => ({ ...prev, first_name: user.first_name || "", last_name: user.last_name || "", email: user.email || "", phone_number: user.phone_number || "" }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ error: "", success: "" });
    try {
      const res = await api.put("auth/profile/", formData);
      if (updateUser) updateUser(res.data);
      setFeedback({ error: "", success: "Details updated securely." });
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setFeedback({ error: "Failed to update profile details.", success: "" });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      <div onClick={onClose} className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#faf8f5] shadow-2xl flex flex-col justify-between border-l border-amber-200/50">
          <div className="p-5 border-b border-amber-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-serif font-black text-stone-900">Client Profile</h2>
                <p className="text-[10px] uppercase tracking-widest font-semibold text-amber-800/60">Secure Credentials</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-stone-400 hover:text-amber-700 hover:bg-amber-50 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            {loading ? (
              <div className="py-32 flex flex-col items-center justify-center gap-3 text-stone-400">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                <span className="text-xs uppercase tracking-widest font-bold">Accessing Vault...</span>
              </div>
            ) : (
              <form onSubmit={handleSave} id="profile-edit-form" className="space-y-6">
                {feedback.success && (
                  <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold tracking-wide">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{feedback.success}</span>
                  </div>
                )}
                {feedback.error && (
                  <div className="p-3.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-bold tracking-wide">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{feedback.error}</span>
                  </div>
                )}

                <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-sm shadow-amber-900/5 space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-50 pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-amber-500" /> Identity
                    </span>
                    <span className="text-[9px] font-extrabold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-widest">
                      {user?.role || "COLLECTOR"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold uppercase tracking-wider text-stone-600 mb-1.5">First Name</label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                        <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-medium text-stone-900 transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold uppercase tracking-wider text-stone-600 mb-1.5">Last Name</label>
                      <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-medium text-stone-900 transition-all" />
                    </div>
                  </div>
                  <div className="text-xs">
                    <label className="block font-bold uppercase tracking-wider text-stone-600 mb-1.5">Email (Read-Only)</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                      <input type="email" disabled value={formData.email} className="w-full pl-9 pr-3 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-stone-500 font-medium cursor-not-allowed" />
                    </div>
                  </div>
                  <div className="text-xs">
                    <label className="block font-bold uppercase tracking-wider text-stone-600 mb-1.5">Phone Line</label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                      <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-medium text-stone-900 transition-all" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-sm shadow-amber-900/5 space-y-4">
                  <div className="border-b border-stone-50 pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" /> Secure Delivery Destination
                    </span>
                  </div>
                  <div className="text-xs">
                    <label className="block font-bold uppercase tracking-wider text-stone-600 mb-1.5">Address / Estate / Suite</label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                      <textarea rows={2} name="address" value={formData.address} onChange={handleChange} className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-medium text-stone-900 transition-all" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold uppercase tracking-wider text-stone-600 mb-1.5">City / District</label>
                      <div className="relative">
                        <Building className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                        <input type="text" name="city_district" value={formData.city_district} onChange={handleChange} className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-medium text-stone-900 transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold uppercase tracking-wider text-stone-600 mb-1.5">State</label>
                      <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-medium text-stone-900 transition-all" />
                    </div>
                  </div>
                  <div className="text-xs">
                    <label className="block font-bold uppercase tracking-wider text-stone-600 mb-1.5">Postal Code</label>
                    <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-mono font-bold tracking-widest text-stone-900 transition-all" />
                  </div>
                </div>
              </form>
            )}
          </div>

          <div className="p-5 border-t border-amber-100 flex items-center justify-end gap-3 bg-white">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-stone-500 bg-stone-50 hover:bg-stone-100 rounded-full text-xs font-bold uppercase tracking-wider transition-colors">
              Close
            </button>
            <button form="profile-edit-form" type="submit" disabled={saving || loading} className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white rounded-full text-xs font-extrabold uppercase tracking-widest shadow-md shadow-amber-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? "Sealing..." : "Update Vault"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}