// src/pages/VendorStudio.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { 
  Package, Plus, Trash2, Truck, Store, 
  CheckCircle2, AlertTriangle, MapPin, ExternalLink, 
  Power, X, IndianRupee, Eye, Loader2, Sparkles 
} from "lucide-react";

export default function VendorStudio() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("catalog");
  const [vendorProfile, setVendorProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals & Forms
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [fulfillmentForm, setFulfillmentForm] = useState({ status: "PROCESSING", tracking_carrier: "", tracking_number: "" });
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({ name: "", category: "", brand: "", sku: "", base_price: "", discount_price: "", stock: "10", description: "" });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { 
    if (user) fetchVendorStudioData(); 
  }, [user]);

  const fetchVendorStudioData = async () => {
    try {
      setLoading(true);
      // Ensure backend endpoints match your Django URLs exactly
      const [profileRes, productsRes, categoriesRes, ordersRes] = await Promise.all([
        api.get("store/vendor/profile/"),
        api.get("store/vendor/products/"),
        api.get("store/categories/"), // Assuming public or specific vendor categories
        api.get("store/vendor/orders/")
      ]);

      setVendorProfile(profileRes.data);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data.results || categoriesRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      console.error("Failed to load studio data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProductStatus = async (productId, currentStatus) => {
    try {
      await api.patch(`store/vendor/products/${productId}/`, { is_active: !currentStatus });
      setProducts(products.map(p => p.id === productId ? { ...p, is_active: !currentStatus } : p));
    } catch (err) {
      alert("Failed to toggle product status.");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Permanently delete this design from your catalog?")) return;
    try {
      await api.delete(`store/vendor/products/${productId}/`);
      setProducts(products.filter(p => p.id !== productId));
    } catch (err) {
      alert("Failed to delete product.");
    }
  };

  const handleOpenFulfillment = (item) => {
    setSelectedOrder(item);
    setFulfillmentForm({ 
      status: item.status || "PROCESSING", 
      tracking_carrier: item.tracking_carrier || "", 
      tracking_number: item.tracking_number || "" 
    });
  };

  const handleUpdateFulfillment = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await api.patch(`store/vendor/orders/${selectedOrder.id}/`, fulfillmentForm);
      setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, ...fulfillmentForm } : o));
      setSelectedOrder(null);
    } catch (err) {
      alert("Failed to update dispatch status.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await api.post("store/vendor/products/", productForm);
      setProducts([res.data, ...products]);
      setShowProductModal(false);
      setProductForm({ name: "", category: "", brand: "", sku: "", base_price: "", discount_price: "", stock: "10", description: "" });
    } catch (err) {
      alert(err.response?.data?.error || "Failed to publish product.");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return (
    <div className="py-32 flex flex-col items-center justify-center bg-[#080808] min-h-screen text-[#C9A96A]">
      <div className="w-12 h-12 border-4 border-[#C9A96A] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-widest text-[#F5E6D3]/50">Loading Studio...</p>
    </div>
  );

  const pendingOrders = orders.filter(o => o.status !== "DELIVERED" && o.status !== "CANCELLED").length;
  const totalEarnings = orders.filter(o => o.status === "DELIVERED").reduce((acc, curr) => acc + (Number(curr.unit_price) * curr.quantity), 0);

  return (
    <div className="min-h-screen bg-[#080808] py-12 text-[#F5E6D3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Studio Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-8 border-b border-[#C9A96A]/20 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Store className="w-6 h-6 text-[#C9A96A]" />
              <h1 className="text-3xl font-serif font-black text-[#C9A96A]">{vendorProfile?.store_name || "Designer Studio"}</h1>
            </div>
            <p className="text-xs uppercase font-bold tracking-widest text-[#F5E6D3]/60 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#C9A96A]" /> Curate your collections and dispatch orders
            </p>
          </div>
          
          <div className="flex bg-[#111111] p-1.5 rounded-2xl border border-[#C9A96A]/30 overflow-x-auto w-full md:w-auto scrollbar-none">
            <button onClick={() => setActiveTab("catalog")} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "catalog" ? "bg-[#C9A96A] text-[#080808] shadow-lg shadow-[#C9A96A]/20" : "text-[#F5E6D3]/60 hover:text-[#C9A96A]"}`}>
              Boutique <span className={`ml-1.5 px-1.5 py-0.5 rounded-md ${activeTab === 'catalog' ? 'bg-[#080808]/20' : 'bg-[#080808]'}`}>{products.length}</span>
            </button>
            <button onClick={() => setActiveTab("orders")} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "orders" ? "bg-[#C9A96A] text-[#080808] shadow-lg shadow-[#C9A96A]/20" : "text-[#F5E6D3]/60 hover:text-[#C9A96A]"}`}>
              Orders <span className={`ml-1.5 px-1.5 py-0.5 rounded-md ${activeTab === 'orders' ? 'bg-[#080808]/20' : 'bg-[#080808]'}`}>{orders.length}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          <div className="bg-[#111111] p-6 rounded-[2rem] border border-[#C9A96A]/20 flex flex-col items-center justify-center text-center">
            <Package className="w-6 h-6 text-[#C9A96A]/50 mb-2" />
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#F5E6D3]/50">Active Designs</p>
            <p className="text-3xl font-serif font-black text-[#C9A96A] mt-1">{products.filter(p => p.is_active).length}</p>
          </div>
          <div className="bg-[#111111] p-6 rounded-[2rem] border border-[#C9A96A]/20 flex flex-col items-center justify-center text-center">
            <Truck className="w-6 h-6 text-amber-500/50 mb-2" />
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#F5E6D3]/50">Pending Dispatches</p>
            <p className="text-3xl font-serif font-black text-amber-500 mt-1">{pendingOrders}</p>
          </div>
          <div className="bg-[#111111] p-6 rounded-[2rem] border border-[#C9A96A]/20 flex flex-col items-center justify-center text-center">
            <IndianRupee className="w-6 h-6 text-emerald-500/50 mb-2" />
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#F5E6D3]/50">Cleared Revenue</p>
            <p className="text-3xl font-serif font-black text-emerald-500 mt-1">₹{totalEarnings.toLocaleString()}</p>
          </div>
        </div>

        {/* CATALOG TAB */}
        {activeTab === "catalog" && (
          <div className="mt-10 bg-[#111111] rounded-[2rem] border border-[#C9A96A]/20 overflow-hidden">
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#C9A96A]/20 bg-[#151515]">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#C9A96A]">Runway Inventory</h2>
                <p className="text-xs text-[#F5E6D3]/50 mt-1">Manage pricing, stock, and visibility of your designs.</p>
              </div>
              <button onClick={() => setShowProductModal(true)} className="flex items-center gap-2 bg-[#C9A96A] hover:bg-[#B38D46] transition-colors text-[#080808] px-5 py-2.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                <Plus className="w-3.5 h-3.5" /> Publish New Piece
              </button>
            </div>
            
            <div className="p-6 sm:p-8">
              {products.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center">
                  <Package className="w-16 h-16 text-[#C9A96A]/20 mb-4" />
                  <h3 className="text-lg font-serif font-bold text-[#F5E6D3]">Your boutique is empty</h3>
                  <p className="text-xs text-[#F5E6D3]/50 mt-2">Publish your first design to start selling.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map(p => (
                    <div key={p.id} className="bg-[#080808] group rounded-2xl border border-[#C9A96A]/20 overflow-hidden hover:border-[#C9A96A]/50 transition-colors">
                      <div className="aspect-[4/5] bg-[#111111] relative overflow-hidden flex items-center justify-center">
                        {p.primary_image || p.images?.[0]?.image_url ? (
                          <img src={p.primary_image || p.images[0].image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <Package className="w-10 h-10 text-[#C9A96A]/20" />
                        )}
                        <div className="absolute top-3 left-3">
                          <span className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-full border ${p.is_active ? 'bg-emerald-900/40 text-emerald-400 border-emerald-500/30' : 'bg-red-900/40 text-red-400 border-red-500/30'}`}>
                            {p.is_active ? 'Live' : 'Hidden'}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-serif font-bold text-sm text-[#F5E6D3] line-clamp-1 pr-2" title={p.name}>{p.name}</h3>
                          <span className="font-mono font-bold text-[#C9A96A] text-xs">₹{p.base_price}</span>
                        </div>
                        <p className="text-[10px] text-[#F5E6D3]/50 uppercase tracking-widest mb-4">Stock: {p.stock} units</p>
                        
                        <div className="flex items-center gap-2 pt-4 border-t border-[#C9A96A]/10">
                          <button onClick={() => handleToggleProductStatus(p.id, p.is_active)} className="flex-1 py-2 text-[9px] uppercase tracking-widest font-bold border border-[#C9A96A]/30 rounded-lg hover:bg-[#C9A96A]/10 transition-colors flex items-center justify-center gap-1.5 text-[#F5E6D3]">
                            <Power className="w-3 h-3" /> {p.is_active ? 'Hide' : 'Publish'}
                          </button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="p-2 border border-red-900/50 text-red-400 rounded-lg hover:bg-red-900/20 transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="mt-10 bg-[#111111] rounded-[2rem] border border-[#C9A96A]/20 overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-[#C9A96A]/20 bg-[#151515]">
              <h2 className="text-xl font-serif font-bold text-[#C9A96A]">Dispatch Management</h2>
              <p className="text-xs text-[#F5E6D3]/50 mt-1">Update fulfillment statuses and attach courier tracking details.</p>
            </div>
            
            <div className="p-0">
              {orders.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center">
                  <Truck className="w-16 h-16 text-[#C9A96A]/20 mb-4" />
                  <h3 className="text-lg font-serif font-bold text-[#F5E6D3]">No orders yet</h3>
                  <p className="text-xs text-[#F5E6D3]/50 mt-2">When clients purchase your designs, they will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-[#F5E6D3]">
                    <thead className="bg-[#080808] text-[9px] uppercase tracking-[0.2em] text-[#C9A96A] border-b border-[#C9A96A]/30">
                      <tr>
                        <th className="py-5 px-6">Order Details</th>
                        <th className="py-5 px-6">Quantity & Price</th>
                        <th className="py-5 px-6">Current Status</th>
                        <th className="py-5 px-6 text-right">Fulfillment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C9A96A]/10">
                      {orders.map(item => (
                        <tr key={item.id} className="hover:bg-[#080808]/50 transition-colors">
                          <td className="py-5 px-6">
                            <span className="font-bold font-serif block text-sm">{item.product_name || `Product #${item.product_id}`}</span>
                            <span className="text-[10px] text-[#F5E6D3]/50 font-mono tracking-widest mt-1 block">Ref: #{item.id}</span>
                          </td>
                          <td className="py-5 px-6">
                            <span className="block text-xs font-bold text-[#F5E6D3]">{item.quantity} Unit{item.quantity > 1 ? 's' : ''}</span>
                            <span className="text-[10px] text-[#C9A96A] font-mono mt-1 block">₹{item.unit_price} each</span>
                          </td>
                          <td className="py-5 px-6">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-black border ${
                              item.status === 'DELIVERED' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' : 
                              item.status === 'SHIPPED' ? 'bg-amber-900/30 text-amber-400 border-amber-500/30' : 
                              item.status === 'CANCELLED' ? 'bg-red-900/30 text-red-400 border-red-500/30' :
                              'bg-[#111111] text-[#F5E6D3]/70 border-[#C9A96A]/30'
                            }`}>
                              {item.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-5 px-6 text-right">
                            <button onClick={() => handleOpenFulfillment(item)} className="px-4 py-2 text-[9px] uppercase tracking-widest font-bold border border-[#C9A96A] bg-[#C9A96A]/10 text-[#C9A96A] hover:bg-[#C9A96A] hover:text-[#080808] rounded-full transition-colors flex items-center justify-center gap-1.5 ml-auto">
                              <Truck className="w-3 h-3" /> Update
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FULFILLMENT MODAL */}
        {selectedOrder && (
          <div className="fixed inset-0 z-[70] bg-[#080808]/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111111] rounded-[2rem] max-w-md w-full p-8 border border-[#C9A96A]/30 shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-serif font-black text-[#C9A96A]">Dispatch Order</h3>
                  <p className="text-[10px] uppercase tracking-widest text-[#F5E6D3]/50 mt-1">Ref #{selectedOrder.id}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-[#F5E6D3]/50 hover:text-[#C9A96A] transition-colors"><X className="w-5 h-5"/></button>
              </div>

              <form onSubmit={handleUpdateFulfillment} className="space-y-5">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-[#C9A96A] mb-1.5 px-1">Fulfillment Status</label>
                  <select value={fulfillmentForm.status} onChange={(e) => setFulfillmentForm({...fulfillmentForm, status: e.target.value})} className="w-full p-3 bg-[#080808] text-[#F5E6D3] text-sm border border-[#C9A96A]/30 rounded-xl outline-none focus:border-[#C9A96A] transition-colors">
                    <option value="CONFIRMED">Order Confirmed</option>
                    <option value="PROCESSING">Processing in Studio</option>
                    <option value="SHIPPED">Handed to Courier</option>
                    <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                    <option value="DELIVERED">Delivered to Client</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 gap-5 pt-2 border-t border-[#C9A96A]/10">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-[#C9A96A] mb-1.5 px-1">Courier Service (Optional)</label>
                    <input type="text" placeholder="e.g., BlueDart, FedEx" value={fulfillmentForm.tracking_carrier} onChange={(e) => setFulfillmentForm({...fulfillmentForm, tracking_carrier: e.target.value})} className="w-full p-3 bg-[#080808] text-[#F5E6D3] text-sm border border-[#C9A96A]/30 rounded-xl outline-none focus:border-[#C9A96A] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-[#C9A96A] mb-1.5 px-1">Tracking Number (Optional)</label>
                    <input type="text" placeholder="AWB / Tracking ID" value={fulfillmentForm.tracking_number} onChange={(e) => setFulfillmentForm({...fulfillmentForm, tracking_number: e.target.value})} className="w-full p-3 bg-[#080808] text-[#F5E6D3] text-sm font-mono border border-[#C9A96A]/30 rounded-xl outline-none focus:border-[#C9A96A] transition-colors" />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-6">
                  <button type="button" disabled={formLoading} onClick={() => setSelectedOrder(null)} className="text-xs font-bold text-[#F5E6D3]/60 hover:text-white uppercase px-4 transition-colors">Cancel</button>
                  <button type="submit" disabled={formLoading} className="bg-[#C9A96A] hover:bg-[#B38D46] text-[#080808] px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2">
                    {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />} Dispatch
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CREATE PRODUCT MODAL */}
        {showProductModal && (
          <div className="fixed inset-0 z-[70] bg-[#080808]/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111111] rounded-[2rem] max-w-2xl w-full p-8 border border-[#C9A96A]/30 shadow-2xl overflow-y-auto max-h-[90vh] scrollbar-none">
              <div className="flex justify-between items-start mb-6 border-b border-[#C9A96A]/20 pb-4">
                <div>
                  <h3 className="text-xl font-serif font-black text-[#C9A96A]">Catalog New Design</h3>
                  <p className="text-[10px] uppercase tracking-widest text-[#F5E6D3]/50 mt-1">Add a new piece to your boutique</p>
                </div>
                <button onClick={() => setShowProductModal(false)} className="text-[#F5E6D3]/50 hover:text-[#C9A96A] transition-colors"><X className="w-5 h-5"/></button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-[#C9A96A] mb-1.5 px-1">Design Name</label>
                    <input type="text" required value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} className="w-full p-3 bg-[#080808] text-[#F5E6D3] text-sm border border-[#C9A96A]/30 rounded-xl outline-none focus:border-[#C9A96A] transition-colors" />
                  </div>
                  
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-[#C9A96A] mb-1.5 px-1">Category</label>
                    <select required value={productForm.category} onChange={(e) => setProductForm({...productForm, category: e.target.value})} className="w-full p-3 bg-[#080808] text-[#F5E6D3] text-sm border border-[#C9A96A]/30 rounded-xl outline-none focus:border-[#C9A96A] transition-colors">
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-[#C9A96A] mb-1.5 px-1">SKU / Item Code</label>
                    <input type="text" value={productForm.sku} onChange={(e) => setProductForm({...productForm, sku: e.target.value})} className="w-full p-3 bg-[#080808] text-[#F5E6D3] text-sm font-mono border border-[#C9A96A]/30 rounded-xl outline-none focus:border-[#C9A96A] transition-colors" />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-[#C9A96A] mb-1.5 px-1">Base Price (₹)</label>
                    <input type="number" step="0.01" required value={productForm.base_price} onChange={(e) => setProductForm({...productForm, base_price: e.target.value})} className="w-full p-3 bg-[#080808] text-[#F5E6D3] text-sm border border-[#C9A96A]/30 rounded-xl outline-none focus:border-[#C9A96A] transition-colors" />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-[#C9A96A] mb-1.5 px-1">Inventory Stock</label>
                    <input type="number" required value={productForm.stock} onChange={(e) => setProductForm({...productForm, stock: e.target.value})} className="w-full p-3 bg-[#080808] text-[#F5E6D3] text-sm border border-[#C9A96A]/30 rounded-xl outline-none focus:border-[#C9A96A] transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-[#C9A96A] mb-1.5 px-1">Product Description</label>
                  <textarea rows="3" required value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} className="w-full p-3 bg-[#080808] text-[#F5E6D3] text-sm border border-[#C9A96A]/30 rounded-xl outline-none focus:border-[#C9A96A] transition-colors resize-none" />
                </div>

                <div className="flex gap-3 justify-end pt-6 border-t border-[#C9A96A]/10">
                  <button type="button" disabled={formLoading} onClick={() => setShowProductModal(false)} className="text-xs font-bold text-[#F5E6D3]/60 hover:text-white uppercase px-4 transition-colors">Cancel</button>
                  <button type="submit" disabled={formLoading} className="bg-[#C9A96A] hover:bg-[#B38D46] text-[#080808] px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2">
                    {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />} Publish
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}