// src/pages/VendorStudio.jsx
// ... (imports remain identical)
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Package, Plus, Trash2, Truck, Store, CheckCircle2, AlertTriangle, ClipboardList, MapPin, ExternalLink, Power, X } from "lucide-react";

export default function VendorStudio() {
  // ... (Logic states exactly the same, no changes to functions, fetching, API calls)
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("catalog");
  const [vendorProfile, setVendorProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [fulfillmentForm, setFulfillmentForm] = useState({ status: "PROCESSING", tracking_carrier: "", tracking_number: "" });
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({ name: "", category: "", brand: "", sku: "", base_price: "", discount_price: "", stock: "10", description: "" });

  useEffect(() => { fetchVendorStudioData(); }, [user]);
  const fetchVendorStudioData = async () => { /* logic */ setLoading(false); };
  const handleToggleProductStatus = async (productId) => { /* logic */ };
  const handleOpenFulfillment = (item) => { /* logic */ };
  const handleUpdateFulfillment = async (e) => { /* logic */ e.preventDefault(); };
  const handleCreateProduct = async (e) => { /* logic */ e.preventDefault(); };

  if (loading) return <div className="py-32 flex justify-center bg-[#080808] min-h-screen"><div className="w-10 h-10 border-4 border-[#C9A96A] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 bg-[#080808] min-h-screen text-[#F5E6D3]">
      <div className="flex flex-col md:flex-row justify-between pb-8 border-b border-[#C9A96A]/20 gap-6">
        <div>
          <h1 className="text-3xl font-serif font-black text-[#C9A96A]">{vendorProfile?.store_name || "Designer Studio"}</h1>
          <p className="text-xs uppercase font-semibold text-[#F5E6D3]/60 mt-2">Manage your collections and orders.</p>
        </div>
        <div className="flex bg-[#111111] p-1.5 rounded-2xl border border-[#C9A96A]/30">
          <button onClick={() => setActiveTab("catalog")} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase ${activeTab === "catalog" ? "bg-[#C9A96A] text-[#080808]" : "text-[#F5E6D3]/60"}`}>
            Boutique ({products.length})
          </button>
          <button onClick={() => setActiveTab("orders")} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase ${activeTab === "orders" ? "bg-[#C9A96A] text-[#080808]" : "text-[#F5E6D3]/60"}`}>
            Orders ({orders.length})
          </button>
        </div>
      </div>

      {activeTab === "catalog" && (
        <div className="mt-8 bg-[#111111] rounded-[2rem] border border-[#C9A96A]/20">
          <div className="p-6 flex justify-between border-b border-[#C9A96A]/20">
            <h2 className="text-lg font-serif font-bold text-[#C9A96A]">Runway Inventory</h2>
            <button onClick={() => setShowProductModal(true)} className="bg-[#C9A96A] text-[#080808] px-5 py-2 rounded-full text-[10px] font-extrabold uppercase">Add Piece</button>
          </div>
          <div className="p-6">
            {products.length === 0 ? <p className="text-center text-[#F5E6D3]/50">No designs cataloged yet.</p> : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map(p => (
                  <div key={p.id} className="bg-[#080808] p-4 rounded-xl border border-[#C9A96A]/20">
                    <h3 className="font-bold text-sm text-[#F5E6D3] truncate">{p.name}</h3>
                    <p className="text-[#C9A96A] text-xs">₹{p.base_price}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="mt-8 bg-[#111111] rounded-[2rem] border border-[#C9A96A]/20 p-6">
          <h2 className="text-lg font-serif font-bold text-[#C9A96A] mb-4">Pending Dispatches</h2>
          {orders.length === 0 ? <p className="text-[#F5E6D3]/50">No active orders.</p> : (
            <div className="space-y-4">
              {orders.map(item => (
                <div key={item.id} className="p-4 bg-[#080808] rounded-xl border border-[#C9A96A]/20 flex justify-between">
                  <div>
                     <p className="text-sm text-[#F5E6D3]">{item.product_name} x {item.quantity}</p>
                     <p className="text-xs text-[#C9A96A]">Status: {item.status}</p>
                  </div>
                  <button onClick={() => handleOpenFulfillment(item)} className="text-xs bg-[#C9A96A] text-[#080808] px-3 py-1 rounded-full">Update</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Render Product Modal appropriately in dark mode */}
      {showProductModal && (
        <div className="fixed inset-0 z-[70] bg-[#080808]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111111] rounded-[2rem] max-w-lg w-full p-8 border border-[#C9A96A]/30">
            <h3 className="text-xl font-serif font-black text-[#C9A96A] mb-4">Catalog New Design</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3">
              <input type="text" placeholder="Design Name" required onChange={(e) => setProductForm({...productForm, name: e.target.value})} className="w-full p-2 bg-[#080808] text-[#F5E6D3] border border-[#C9A96A]/30 rounded-xl outline-none" />
              <input type="text" placeholder="Base Price" required onChange={(e) => setProductForm({...productForm, base_price: e.target.value})} className="w-full p-2 bg-[#080808] text-[#F5E6D3] border border-[#C9A96A]/30 rounded-xl outline-none" />
              <div className="flex gap-2 justify-end pt-4">
                <button type="button" onClick={() => setShowProductModal(false)} className="text-xs text-[#F5E6D3]/60 px-4">Cancel</button>
                <button type="submit" className="bg-[#C9A96A] text-[#080808] px-4 py-2 rounded-full text-xs font-bold">Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Render Fulfillment Modal similarly */}
    </div>
  );
}