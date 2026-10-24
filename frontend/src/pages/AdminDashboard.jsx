// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Users, Package, AlertCircle, DollarSign, ShieldCheck, CheckCircle2, Store } from 'lucide-react';
import api from '../api/axios';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data States
  const [stats, setStats] = useState({ total_revenue: 0, active_boutiques: 0, open_tickets: 0 });
  const [vendors, setVendors] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);

  // Catalog Edit Modal States
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', base_price: '', stock: '' });

  // Fetch data dynamically based on the active tab
  useEffect(() => {
    if (activeTab === 'overview') fetchStats();
    else if (activeTab === 'vendors') fetchVendors();
    else if (activeTab === 'disputes') fetchTickets();
    else if (activeTab === 'catalog') fetchCatalog();
  }, [activeTab]);

  // --- CATALOG EDIT FUNCTIONS ---
  const handleSaveProductEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`store/admin/products/${editingProduct.id}/edit/`, editForm);
      // Update the catalog list instantly with the new data
      setCatalog(catalog.map(p => 
        p.id === editingProduct.id 
          ? { ...p, name: res.data.name, base_price: res.data.base_price, stock: res.data.stock } 
          : p
      ));
      setEditingProduct(null); // Close modal
    } catch (err) {
      alert('Failed to update product details.');
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditForm({ name: product.name, base_price: product.base_price, stock: product.stock });
  };

  // --- DASHBOARD OVERVIEW FUNCTIONS ---
  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('store/admin/stats/');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- VENDOR MANAGEMENT FUNCTIONS ---
  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await api.get('store/admin/vendors/');
      setVendors(res.data);
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleVendorApproval = async (vendorId, currentStatus) => {
    try {
      await api.patch(`store/admin/vendors/${vendorId}/toggle-approval/`, {
        is_approved: !currentStatus
      });
      setVendors(vendors.map(v => 
        v.id === vendorId ? { ...v, is_approved: !currentStatus } : v
      ));
    } catch (err) {
      alert('Failed to update boutique status.');
    }
  };

  // --- SUPPORT TICKET FUNCTIONS ---
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('store/admin/complaints/');
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const resolveTicket = async (ticketId) => {
    try {
      await api.patch(`store/admin/complaints/${ticketId}/resolve/`, { status: 'RESOLVED' });
      setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: 'RESOLVED' } : t));
    } catch (err) {
      alert('Failed to resolve ticket.');
    }
  };

  // --- GLOBAL CATALOG FUNCTIONS ---
  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await api.get('store/admin/products/');
      setCatalog(res.data);
    } catch (err) {
      console.error('Failed to fetch global catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleProductActive = async (productId, currentStatus) => {
    try {
      await api.patch(`store/admin/products/${productId}/toggle-active/`, {
        is_active: !currentStatus
      });
      setCatalog(catalog.map(p => 
        p.id === productId ? { ...p, is_active: !currentStatus } : p
      ));
    } catch (err) {
      alert('Failed to update piece visibility.');
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5E6D3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="mb-10 border-b border-[#C9A96A]/20 pb-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#C9A96A]">Master Control</h1>
            <p className="text-xs uppercase tracking-widest font-bold text-[#F5E6D3]/60 mt-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C9A96A]" /> Super Admin Dashboard
            </p>
          </div>
        </div>

        {/* Dashboard Layout */}
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0 space-y-2">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-[#C9A96A] text-[#080808]' : 'bg-[#111111] text-[#F5E6D3]/60 hover:text-[#C9A96A]'}`}>
              <DollarSign className="w-4 h-4" /> Overview
            </button>
            <button onClick={() => setActiveTab('vendors')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'vendors' ? 'bg-[#C9A96A] text-[#080808]' : 'bg-[#111111] text-[#F5E6D3]/60 hover:text-[#C9A96A]'}`}>
              <Users className="w-4 h-4" /> Boutiques
            </button>
            <button onClick={() => setActiveTab('catalog')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'catalog' ? 'bg-[#C9A96A] text-[#080808]' : 'bg-[#111111] text-[#F5E6D3]/60 hover:text-[#C9A96A]'}`}>
              <Package className="w-4 h-4" /> Global Catalog
            </button>
            <button onClick={() => setActiveTab('disputes')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'disputes' ? 'bg-[#C9A96A] text-[#080808]' : 'bg-[#111111] text-[#F5E6D3]/60 hover:text-[#C9A96A]'}`}>
              <AlertCircle className="w-4 h-4" /> Support Tickets
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-[#111111] rounded-[2rem] border border-[#C9A96A]/20 p-8 relative">
            
            {/* --- OVERVIEW TAB --- */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-xl font-serif font-bold text-[#C9A96A]">Platform Overview</h2>
                
                {loading ? (
                  <div className="py-20 flex justify-center">
                    <div className="w-8 h-8 border-4 border-[#C9A96A] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-[#080808] p-6 rounded-2xl border border-[#C9A96A]/30">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-[#F5E6D3]/50">Total Revenue</p>
                      <p className="text-3xl font-serif font-black text-[#C9A96A] mt-2">
                        ₹{Number(stats.total_revenue).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-[#080808] p-6 rounded-2xl border border-[#C9A96A]/30">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-[#F5E6D3]/50">Active Boutiques</p>
                      <p className="text-3xl font-serif font-black text-[#C9A96A] mt-2">
                        {stats.active_boutiques}
                      </p>
                    </div>
                    <div className="bg-[#080808] p-6 rounded-2xl border border-[#C9A96A]/30">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-[#F5E6D3]/50">Open Tickets</p>
                      <p className="text-3xl font-serif font-black text-[#C9A96A] mt-2">
                        {stats.open_tickets}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- VENDORS / BOUTIQUES TAB --- */}
            {activeTab === 'vendors' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif font-bold text-[#C9A96A]">Boutique Approvals</h2>
                  <span className="px-3 py-1 bg-[#C9A96A]/10 text-[#C9A96A] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#C9A96A]/30">
                    {vendors.length} Total
                  </span>
                </div>

                {loading ? (
                  <div className="py-20 flex justify-center">
                    <div className="w-8 h-8 border-4 border-[#C9A96A] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : vendors.length === 0 ? (
                  <div className="bg-[#080808] border border-[#C9A96A]/30 rounded-xl p-12 text-center">
                    <Store className="w-10 h-10 text-[#C9A96A]/40 mx-auto mb-3" />
                    <p className="text-[#F5E6D3]/50 text-sm font-medium">No designer boutiques have registered yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[#F5E6D3]">
                      <thead className="bg-[#080808] text-[9px] uppercase tracking-[0.2em] text-[#C9A96A] border-b border-[#C9A96A]/30">
                        <tr>
                          <th className="py-4 px-5">Design House</th>
                          <th className="py-4 px-5">Representative</th>
                          <th className="py-4 px-5">Status</th>
                          <th className="py-4 px-5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C9A96A]/10">
                        {vendors.map((vendor) => (
                          <tr key={vendor.id} className="hover:bg-[#080808]/50 transition-colors">
                            <td className="py-4 px-5 font-bold font-serif">{vendor.store_name}</td>
                            <td className="py-4 px-5 text-xs text-[#F5E6D3]/70">{vendor.user_email}</td>
                            <td className="py-4 px-5">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-black border ${
                                vendor.is_approved 
                                  ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' 
                                  : 'bg-amber-900/30 text-amber-400 border-amber-500/30'
                              }`}>
                                {vendor.is_approved ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                {vendor.is_approved ? 'Approved' : 'Pending'}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right">
                              <button
                                onClick={() => toggleVendorApproval(vendor.id, vendor.is_approved)}
                                className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold rounded-full transition-all border ${
                                  vendor.is_approved
                                    ? 'bg-red-900/20 hover:bg-red-900/40 text-red-400 border-red-500/30'
                                    : 'bg-[#C9A96A] hover:bg-[#B38D46] text-[#080808] border-[#C9A96A]'
                                }`}
                              >
                                {vendor.is_approved ? 'Revoke Access' : 'Authorize'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* --- GLOBAL CATALOG TAB --- */}
            {activeTab === 'catalog' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif font-bold text-[#C9A96A]">Platform Catalog</h2>
                  <span className="px-3 py-1 bg-[#C9A96A]/10 text-[#C9A96A] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#C9A96A]/30">
                    {catalog.length} Pieces
                  </span>
                </div>

                {loading ? (
                  <div className="py-20 flex justify-center">
                    <div className="w-8 h-8 border-4 border-[#C9A96A] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : catalog.length === 0 ? (
                  <div className="bg-[#080808] border border-[#C9A96A]/30 rounded-xl p-12 text-center">
                    <Package className="w-10 h-10 text-[#C9A96A]/40 mx-auto mb-3" />
                    <p className="text-[#F5E6D3]/50 text-sm font-medium">No pieces have been cataloged yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[#F5E6D3]">
                      <thead className="bg-[#080808] text-[9px] uppercase tracking-[0.2em] text-[#C9A96A] border-b border-[#C9A96A]/30">
                        <tr>
                          <th className="py-4 px-5">Creation</th>
                          <th className="py-4 px-5">Boutique</th>
                          <th className="py-4 px-5">Value</th>
                          <th className="py-4 px-5">Status</th>
                          <th className="py-4 px-5 text-right">Moderation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C9A96A]/10">
                        {catalog.map((item) => (
                          <tr key={item.id} className="hover:bg-[#080808]/50 transition-colors">
                            <td className="py-4 px-5">
                              <span className="font-bold font-serif block">{item.name}</span>
                              <span className="text-[10px] text-[#F5E6D3]/50 uppercase tracking-widest">{item.category_name}</span>
                            </td>
                            <td className="py-4 px-5 text-xs text-[#F5E6D3]/70">{item.vendor_name}</td>
                            <td className="py-4 px-5 font-mono text-[#C9A96A]">₹{item.base_price}</td>
                            <td className="py-4 px-5">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-black border ${
                                item.is_active 
                                  ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' 
                                  : 'bg-red-900/30 text-red-400 border-red-500/30'
                              }`}>
                                {item.is_active ? 'Visible' : 'Suspended'}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right flex items-center justify-end gap-2">
                              {/* EDIT BUTTON */}
                              <button
                                onClick={() => openEditModal(item)}
                                className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold rounded-full transition-all border bg-[#111111] hover:bg-[#C9A96A] text-[#C9A96A] hover:text-[#080808] border-[#C9A96A]/50"
                              >
                                Edit
                              </button>
                              
                              <button
                                onClick={() => toggleProductActive(item.id, item.is_active)}
                                className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold rounded-full transition-all border ${
                                  item.is_active
                                    ? 'bg-red-900/20 hover:bg-red-900/40 text-red-400 border-red-500/30'
                                    : 'bg-[#C9A96A] hover:bg-[#B38D46] text-[#080808] border-[#C9A96A]'
                                }`}
                              >
                                {item.is_active ? 'Delist' : 'Restore'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* --- SUPPORT TICKETS TAB --- */}
            {activeTab === 'disputes' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif font-bold text-[#C9A96A]">Client Support</h2>
                  <span className="px-3 py-1 bg-[#C9A96A]/10 text-[#C9A96A] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#C9A96A]/30">
                    {tickets.filter(t => t.status !== 'RESOLVED').length} Open
                  </span>
                </div>

                {loading ? (
                  <div className="py-20 flex justify-center">
                    <div className="w-8 h-8 border-4 border-[#C9A96A] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="bg-[#080808] border border-[#C9A96A]/30 rounded-xl p-12 text-center">
                    <AlertCircle className="w-10 h-10 text-[#C9A96A]/40 mx-auto mb-3" />
                    <p className="text-[#F5E6D3]/50 text-sm font-medium">No support tickets at this time.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <div key={ticket.id} className="bg-[#080808] border border-[#C9A96A]/30 rounded-2xl p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${
                              ticket.status === 'RESOLVED' 
                                ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30'
                                : 'bg-red-900/30 text-red-400 border-red-500/30'
                            }`}>
                              {ticket.status || 'OPEN'}
                            </span>
                            <span className="text-xs font-mono font-bold text-[#C9A96A]">Ref #{ticket.order_ref}</span>
                          </div>
                          <span className="text-[10px] font-bold text-[#F5E6D3]/50 uppercase tracking-widest">
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <h4 className="text-sm font-bold text-[#F5E6D3] mb-1">{ticket.subject}</h4>
                        <p className="text-xs text-[#F5E6D3]/70 leading-relaxed mb-4">{ticket.description}</p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-[#C9A96A]/10">
                          <div className="text-[10px] text-[#F5E6D3]/50 font-bold uppercase tracking-widest">
                            Client: <span className="text-[#C9A96A]">{ticket.customer_email}</span>
                          </div>
                          {ticket.status !== 'RESOLVED' && (
                            <button
                              onClick={() => resolveTicket(ticket.id)}
                              className="px-4 py-2 text-[9px] uppercase tracking-widest font-black text-[#080808] bg-[#C9A96A] hover:bg-[#B38D46] rounded-full transition-colors"
                            >
                              Mark Resolved
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* --- EDIT PRODUCT MODAL (This was missing!) --- */}
            {editingProduct && (
              <div className="fixed inset-0 z-50 bg-[#080808]/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#111111] rounded-3xl max-w-md w-full p-8 border border-[#C9A96A]/30 shadow-2xl">
                  <h3 className="text-xl font-serif font-black text-[#C9A96A] mb-1">Override Details</h3>
                  <p className="text-[10px] uppercase tracking-widest text-[#F5E6D3]/50 mb-6">Editing: {editingProduct.vendor_name}</p>
                  
                  <form onSubmit={handleSaveProductEdit} className="space-y-4">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-[#C9A96A] mb-1">Piece Name</label>
                      <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full p-3 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none focus:border-[#C9A96A]" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-[#C9A96A] mb-1">Base Price (₹)</label>
                        <input type="number" step="0.01" value={editForm.base_price} onChange={(e) => setEditForm({...editForm, base_price: e.target.value})} className="w-full p-3 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none focus:border-[#C9A96A]" required />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-[#C9A96A] mb-1">Inventory</label>
                        <input type="number" value={editForm.stock} onChange={(e) => setEditForm({...editForm, stock: e.target.value})} className="w-full p-3 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none focus:border-[#C9A96A]" required />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button type="button" onClick={() => setEditingProduct(null)} className="px-5 py-2 text-xs font-bold text-[#F5E6D3]/60 hover:text-white uppercase transition-colors">Cancel</button>
                      <button type="submit" className="px-6 py-2 text-xs font-black uppercase bg-[#C9A96A] hover:bg-[#B38D46] text-[#080808] rounded-full transition-colors">Force Save</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}