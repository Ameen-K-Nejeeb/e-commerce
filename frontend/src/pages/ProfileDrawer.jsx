import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
} from "lucide-react";

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
    pincode: "",
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
        first_name: res.data.first_name || "",
        last_name: res.data.last_name || "",
        email: res.data.email || "",
        phone_number: res.data.phone_number || "",
        address: res.data.address || "",
        city_district: res.data.city_district || "",
        state: res.data.state || "",
        pincode: res.data.pincode || "",
      });
    } catch (err) {
      console.error("Failed to load profile details:", err);
      if (user) {
        setFormData((prev) => ({
          ...prev,
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          email: user.email || "",
          phone_number: user.phone_number || "",
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ error: "", success: "" });

    try {
      const res = await api.put("auth/profile/", formData);

      if (updateUser) {
        updateUser(res.data);
      }

      setFeedback({
        error: "",
        success: "Credentials & delivery address updated successfully!",
      });

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      const serverError =
        err.response?.data?.detail ||
        (err.response?.data && typeof err.response.data === "object"
          ? Object.entries(err.response.data)
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ")
          : "Failed to update credentials.");
      setFeedback({ error: serverError, success: "" });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col justify-between">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-gray-900">
                  Profile & Address Details
                </h2>
                <p className="text-[11px] text-gray-400">
                  Edit contact credentials & default shipping destination
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
            {loading ? (
              <div className="py-32 flex flex-col items-center justify-center gap-3 text-gray-400">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <span className="text-xs font-semibold">Loading profile...</span>
              </div>
            ) : (
              <form onSubmit={handleSave} id="profile-edit-form" className="space-y-6">
                {feedback.success && (
                  <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-2xl flex items-center gap-2 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{feedback.success}</span>
                  </div>
                )}

                {feedback.error && (
                  <div className="p-3.5 bg-rose-50 text-rose-800 border border-rose-100 rounded-2xl flex items-center gap-2 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{feedback.error}</span>
                  </div>
                )}

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-indigo-500" />
                      Account Credentials
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {user?.role || "CUSTOMER"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        First Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          placeholder="First Name"
                          className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-800"
                        />
                        <User className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="Last Name"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-800"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block font-bold text-gray-700 mb-1">
                      Email Address (Read-Only)
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        disabled
                        value={formData.email}
                        className="w-full pl-8 pr-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-medium cursor-not-allowed"
                      />
                      <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block font-bold text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-800"
                      />
                      <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <div className="border-b border-gray-50 pb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      Default Delivery Address
                    </span>
                  </div>

                  <div className="text-xs">
                    <label className="block font-bold text-gray-700 mb-1">
                      Address / House / Street / Area
                    </label>
                    <div className="relative">
                      <textarea
                        rows={2}
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="House name/number, street, landmark..."
                        className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-800"
                      />
                      <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        District / City
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="city_district"
                          value={formData.city_district}
                          onChange={handleChange}
                          placeholder="e.g. Idukki"
                          className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-800"
                        />
                        <Building className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="e.g. Kerala"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-800"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block font-bold text-gray-700 mb-1">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="685531"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-gray-800"
                    />
                  </div>
                </div>
              </form>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              form="profile-edit-form"
              type="submit"
              disabled={saving || loading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving Changes..." : "Save Details"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}