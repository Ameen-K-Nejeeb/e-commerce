// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, Package, AlertCircle, DollarSign, ShieldCheck, 
  CheckCircle2, Store, UserCircle, Layers, Plus, 
  ShoppingCart, Star, EyeOff, Eye 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../api/axios';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data States
  const [stats, setStats] = useState({ total_revenue: 0, active_boutiques: 0, open_tickets: 0, chart_data: [] });
  const [vendors, setVendors] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [clients, setClients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [clientFilter, setClientFilter] = useState('ALL');

  // Modals States
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', base_price: '', stock: '' });

  const [editingClient, setEditingClient] = useState(null);
  const [clientEditForm, setClientEditForm] = useState({ first_name: '', last_name: '', email: '', password: '' });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '', icon: '' });

  const [editingOrder, setEditingOrder] = useState(null);
  const [orderEditForm, setOrderEditForm] = useState({ status: '' });

  // Fetch data dynamically based on the active tab
  useEffect(() => {
    if (activeTab === 'overview') fetchStats();
    else if (activeTab === 'vendors') fetchVendors();
    else if (activeTab === 'disputes') fetchTickets();
    else if (activeTab === 'catalog') fetchCatalog();
    else if (activeTab === 'clients') fetchClients();
    else if (activeTab === 'categories') fetchCategories();
    else if (activeTab === 'orders') fetchOrders();
    else if (activeTab === 'reviews') fetchReviews();
  }, [activeTab]);

  // --- STATS / CHART FUNCTIONS ---
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

  // --- ORDERS FUNCTIONS ---
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('store/admin/orders/');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOrderEdit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`store/admin/orders/${editingOrder.id}/edit/`, orderEditForm);
      setOrders(orders.map(o => o.id === editingOrder.id ? { ...o, status: orderEditForm.status } : o));
      setEditingOrder(null);
    } catch (err) {
      alert('Failed to update order.');
    }
  };

  // --- REVIEWS FUNCTIONS ---
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('store/admin/reviews/');
      setReviews(res.data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleReviewVisibility = async (reviewId, currentStatus) => {
    try {
      await api.patch(`store/admin/reviews/${reviewId}/toggle/`, { is_hidden: !currentStatus });
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, is_hidden: !currentStatus } : r));
    } catch (err) {
      alert('Failed to toggle review visibility.');
    }
  };

  // --- CATEGORY FUNCTIONS ---
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('store/admin/categories/');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryNameChange = (e) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setCategoryForm({ ...categoryForm, name, slug });
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        // Edit Mode
        const res = await api.patch(`store/admin/categories/${editingCategory.id}/edit/`, categoryForm);
        setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...categoryForm } : c));
      } else {
        // Create Mode
        const res = await api.post('store/admin/categories/', categoryForm);
        setCategories([...categories, res.data]);
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', slug: '', description: '', icon: '' });
    } catch (err) {
      alert('Failed to save category. Ensure the name and slug are unique.');
    }
  };

  const toggleCategoryActive = async (categoryId, currentStatus) => {
    try {
      await api.patch(`store/admin/categories/${categoryId}/edit/`, { is_active: !currentStatus });
      setCategories(categories.map(c => c.id === categoryId ? { ...c, is_active: !currentStatus } : c));
    } catch (err) {
      alert('Failed to update category status.');
    }
  };

  const openCategoryEditModal = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, slug: cat.slug, description: cat.description, icon: cat.icon });
    setIsCategoryModalOpen(true);
  };

  // --- CATALOG EDIT FUNCTIONS ---
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
      await api.patch(`store/admin/products/${productId}/toggle-active/`, { is_active: !currentStatus });
      setCatalog(catalog.map(p => p.id === productId ? { ...p, is_active: !currentStatus } : p));
    } catch (err) {
      alert('Failed to update piece visibility.');
    }
  };

  const handleSaveProductEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`store/admin/products/${editingProduct.id}/edit/`, editForm);
      setCatalog(catalog.map(p => 
        p.id === editingProduct.id ? { ...p, name: res.data.name, base_price: res.data.base_price, stock: res.data.stock } : p
      ));
      setEditingProduct(null);
    } catch (err) {
      alert('Failed to update product details.');
    }
  };



  


  // --- CREATE CLIENT MODAL STATES & FUNCTION ---
  const [isCreateClientModalOpen, setIsCreateClientModalOpen] = useState(false);
  const [createClientForm, setCreateClientForm] = useState({ first_name: '', last_name: '', email: '', password: '', role: 'CUSTOMER' });

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('store/admin/users/create/', createClientForm);
      setClients([res.data, ...clients]); // Add new client to the top of the table
      setIsCreateClientModalOpen(false);
      setCreateClientForm({ first_name: '', last_name: '', email: '', password: '', role: 'CUSTOMER' });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create user account.');
    }
  };







  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditForm({ name: product.name, base_price: product.base_price, stock: product.stock });
  };

  // --- CLIENT EDIT FUNCTIONS ---
  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await api.get('store/admin/users/');
      setClients(res.data);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleClientStatus = async (clientId, currentStatus) => {
    try {
      await api.patch(`store/admin/users/${clientId}/toggle-active/`, { is_active: !currentStatus });
      setClients(clients.map(c => c.id === clientId ? { ...c, is_active: !currentStatus } : c));
    } catch (err) {
      if (err.response && err.response.data.error) alert(err.response.data.error);
      else alert('Failed to update client status.');
    }
  };

  const handleSaveClientEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...clientEditForm };
      if (!payload.password) delete payload.password;

      const res = await api.patch(`store/admin/users/${editingClient.id}/edit/`, payload);
      setClients(clients.map(c => 
        c.id === editingClient.id ? { ...c, first_name: res.data.first_name, last_name: res.data.last_name, email: res.data.email } : c
      ));
      setEditingClient(null);
    } catch (err) {
      alert('Failed to update client details.');
    }
  };

  const openClientEditModal = (client) => {
    setEditingClient(client);
    setClientEditForm({ first_name: client.first_name || '', last_name: client.last_name || '', email: client.email || '', password: '' });
  };

  const getRole = (c) => c.role?.toUpperCase() || 'CUSTOMER';
  const clientCounts = {
    ALL: clients.length,
    CUSTOMER: clients.filter(c => getRole(c) === 'CUSTOMER').length,
    VENDOR: clients.filter(c => getRole(c) === 'VENDOR').length,
    ADMIN: clients.filter(c => getRole(c) === 'ADMIN').length,
  };
  const filteredClients = clientFilter === 'ALL' ? clients : clients.filter(c => getRole(c) === clientFilter);

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
      await api.patch(`store/admin/vendors/${vendorId}/toggle-approval/`, { is_approved: !currentStatus });
      setVendors(vendors.map(v => v.id === vendorId ? { ...v, is_approved: !currentStatus } : v));
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

  // Navigation Button Component
  const NavButton = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => setActiveTab(id)} 
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
        activeTab === id ? 'bg-[#C9A96A] text-[#080808]' : 'bg-[#111111] text-[#F5E6D3]/60 hover:text-[#C9A96A]'
      }`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );

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
            <NavButton id="overview" icon={DollarSign} label="Overview" />
            <NavButton id="orders" icon={ShoppingCart} label="Orders" />
            <NavButton id="clients" icon={UserCircle} label="Client Directory" />
            <NavButton id="vendors" icon={Users} label="Boutiques" />
            <NavButton id="categories" icon={Layers} label="Categories" />
            <NavButton id="catalog" icon={Package} label="Global Catalog" />
            <NavButton id="reviews" icon={Star} label="Reviews" />
            <NavButton id="disputes" icon={AlertCircle} label="Support Tickets" />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-[#111111] rounded-[2rem] border border-[#C9A96A]/20 p-8 relative">
            
            {/* --- OVERVIEW TAB --- */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-xl font-serif font-bold text-[#C9A96A]">Platform Overview</h2>
                {loading ? (
                  <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-[#C9A96A] border-t-transparent rounded-full animate-spin" /></div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                      <div className="bg-[#080808] p-6 rounded-2xl border border-[#C9A96A]/30">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-[#F5E6D3]/50">Total Revenue</p>
                        <p className="text-3xl font-serif font-black text-[#C9A96A] mt-2">₹{Number(stats.total_revenue).toFixed(2)}</p>
                      </div>
                      <div className="bg-[#080808] p-6 rounded-2xl border border-[#C9A96A]/30">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-[#F5E6D3]/50">Active Boutiques</p>
                        <p className="text-3xl font-serif font-black text-[#C9A96A] mt-2">{stats.active_boutiques}</p>
                      </div>
                      <div className="bg-[#080808] p-6 rounded-2xl border border-[#C9A96A]/30">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-[#F5E6D3]/50">Open Tickets</p>
                        <p className="text-3xl font-serif font-black text-[#C9A96A] mt-2">{stats.open_tickets}</p>
                      </div>
                    </div>

                    {/* RECHARTS GRAPH */}
                    <div className="bg-[#080808] p-6 rounded-2xl border border-[#C9A96A]/30">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-[#F5E6D3]/70 mb-6">Revenue Analytics (Last 6 Months)</h3>
                      <div className="h-72 w-full">
                        {stats.chart_data && stats.chart_data.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.chart_data}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#C9A96A" opacity={0.1} />
                              <XAxis dataKey="name" stroke="#F5E6D3" opacity={0.5} fontSize={10} tickLine={false} axisLine={false} />
                              <YAxis stroke="#F5E6D3" opacity={0.5} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                              <Tooltip cursor={{fill: '#111111'}} contentStyle={{backgroundColor: '#080808', borderColor: '#C9A96A', borderRadius: '12px'}} itemStyle={{color: '#C9A96A'}} />
                              <Bar dataKey="revenue" fill="#C9A96A" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-[#F5E6D3]/30 text-xs uppercase tracking-widest">No Sales Data Available</div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* --- ORDERS TAB --- */}
            {activeTab === 'orders' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif font-bold text-[#C9A96A]">Platform Orders</h2>
                  <span className="px-3 py-1 bg-[#C9A96A]/10 text-[#C9A96A] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#C9A96A]/30">
                    {orders.length} Transactions
                  </span>
                </div>
                {loading ? (
                  <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-[#C9A96A] border-t-transparent rounded-full animate-spin" /></div>
                ) : orders.length === 0 ? (
                  <div className="bg-[#080808] border border-[#C9A96A]/30 rounded-xl p-12 text-center">
                    <ShoppingCart className="w-10 h-10 text-[#C9A96A]/40 mx-auto mb-3" />
                    <p className="text-[#F5E6D3]/50 text-sm font-medium">No orders have been placed yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[#F5E6D3]">
                      <thead className="bg-[#080808] text-[9px] uppercase tracking-[0.2em] text-[#C9A96A] border-b border-[#C9A96A]/30">
                        <tr>
                          <th className="py-4 px-5">Order Ref</th>
                          <th className="py-4 px-5">Date</th>
                          <th className="py-4 px-5">Client Email</th>
                          <th className="py-4 px-5">Total Amount</th>
                          <th className="py-4 px-5 text-center">Action</th>
                          <th className="py-4 px-5 text-right">Payment Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C9A96A]/10">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-[#080808]/50 transition-colors">
                            <td className="py-4 px-5 font-mono text-[#C9A96A] text-xs">#{order.id}</td>
                            <td className="py-4 px-5 text-xs text-[#F5E6D3]/70">{new Date(order.created_at).toLocaleDateString()}</td>
                            <td className="py-4 px-5 text-xs">{order.user_email}</td>
                            <td className="py-4 px-5 font-bold font-serif">₹{order.total_amount}</td>
                            <td className="py-4 px-5 text-center">
                              <button onClick={() => { setEditingOrder(order); setOrderEditForm({ status: order.status }); }} className="px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold rounded-full transition-all border bg-[#111111] hover:bg-[#C9A96A] text-[#C9A96A] hover:text-[#080808] border-[#C9A96A]/50">
                                Edit
                              </button>
                            </td>
                            <td className="py-4 px-5 text-right">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-black border ${
                                order.status === 'PAID' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' : 'bg-amber-900/30 text-amber-400 border-amber-500/30'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* --- CLIENT DIRECTORY TAB --- */}
            {/* --- CLIENT DIRECTORY TAB w/ DYNAMIC CREATE BUTTON --- */}
            {/* --- CLIENT DIRECTORY TAB w/ CREATE MODAL --- */}
            {activeTab === 'clients' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-serif font-bold text-[#C9A96A]">Client Directory</h2>
                    {/* Dynamic Create Button */}
                    <button 
                      onClick={() => {
                        setCreateClientForm({ ...createClientForm, role: clientFilter === 'ALL' ? 'CUSTOMER' : clientFilter });
                        setIsCreateClientModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#C9A96A] hover:bg-[#B38D46] text-[#080808] rounded-full text-[10px] font-black uppercase tracking-widest transition-colors"
                    >
                      <Plus className="w-3 h-3" /> 
                      Create {clientFilter === 'ALL' ? 'Account' : clientFilter === 'CUSTOMER' ? 'User' : clientFilter === 'VENDOR' ? 'Vendor' : 'Admin'}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-1.5 bg-[#080808] p-1.5 rounded-2xl border border-[#C9A96A]/30 overflow-x-auto scrollbar-none">
                    {[
                      { id: 'ALL', label: 'Total' },
                      { id: 'CUSTOMER', label: 'Users' },
                      { id: 'VENDOR', label: 'Vendors' },
                      { id: 'ADMIN', label: 'Admins' }
                    ].map(filter => (
                      <button
                        key={filter.id}
                        onClick={() => setClientFilter(filter.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                          clientFilter === filter.id ? 'bg-[#C9A96A] text-[#080808] shadow-sm shadow-[#C9A96A]/20' : 'text-[#F5E6D3]/50 hover:text-[#C9A96A]'
                        }`}
                      >
                        {filter.label} 
                        <span className={`px-1.5 py-0.5 rounded-md ${clientFilter === filter.id ? 'bg-[#080808]/20' : 'bg-[#111111]'}`}>
                          {clientCounts[filter.id]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {loading ? (
                  <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-[#C9A96A] border-t-transparent rounded-full animate-spin" /></div>
                ) : filteredClients.length === 0 ? (
                  <div className="bg-[#080808] border border-[#C9A96A]/30 rounded-xl p-12 text-center">
                    <UserCircle className="w-10 h-10 text-[#C9A96A]/40 mx-auto mb-3" />
                    <p className="text-[#F5E6D3]/50 text-sm font-medium">No clients found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[#F5E6D3]">
                      <thead className="bg-[#080808] text-[9px] uppercase tracking-[0.2em] text-[#C9A96A] border-b border-[#C9A96A]/30">
                        <tr>
                          <th className="py-4 px-5">Client Identity</th>
                          <th className="py-4 px-5">Role</th>
                          <th className="py-4 px-5">Joined Date</th>
                          <th className="py-4 px-5">Status</th>
                          <th className="py-4 px-5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C9A96A]/10">
                        {filteredClients.map((client) => (
                          <tr key={client.id} className="hover:bg-[#080808]/50 transition-colors">
                            <td className="py-4 px-5">
                              <span className="font-bold block text-[#F5E6D3]">
                                {client.first_name ? `${client.first_name} ${client.last_name || ''}` : 'Unnamed User'}
                              </span>
                              <span className="text-[10px] text-[#F5E6D3]/50 font-mono tracking-wider">{client.email}</span>
                            </td>
                            <td className="py-4 px-5 text-[10px] font-black uppercase tracking-widest text-[#C9A96A]">
                              {getRole(client)}
                            </td>
                            <td className="py-4 px-5 text-xs text-[#F5E6D3]/70">
                              {new Date(client.date_joined).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-5">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-black border ${
                                client.is_active ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' : 'bg-red-900/30 text-red-400 border-red-500/30'
                              }`}>
                                {client.is_active ? 'Active' : 'Suspended'}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right flex items-center justify-end gap-2">
                              <button onClick={() => openClientEditModal(client)} className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold rounded-full transition-all border bg-[#111111] hover:bg-[#C9A96A] text-[#C9A96A] hover:text-[#080808] border-[#C9A96A]/50">
                                Edit
                              </button>
                              <button onClick={() => toggleClientStatus(client.id, client.is_active)} className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold rounded-full transition-all border ${client.is_active ? 'bg-red-900/20 hover:bg-red-900/40 text-red-400 border-red-500/30' : 'bg-[#C9A96A] hover:bg-[#B38D46] text-[#080808] border-[#C9A96A]'}`}>
                                {client.is_active ? 'Suspend' : 'Reactivate'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* --- CREATE CLIENT MODAL (Attached directly inside the tab) --- */}
                {isCreateClientModalOpen && (
                  <div className="fixed inset-0 z-50 bg-[#080808]/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#111111] rounded-3xl max-w-md w-full p-8 border border-[#C9A96A]/30 shadow-2xl">
                      <h3 className="text-xl font-serif font-black text-[#C9A96A] mb-1">
                        Create {createClientForm.role === 'CUSTOMER' ? 'User' : createClientForm.role === 'VENDOR' ? 'Vendor' : 'Admin'}
                      </h3>
                      <p className="text-[10px] uppercase tracking-widest text-[#F5E6D3]/50 mb-6">Initialize a new platform account</p>
                      
                      <form onSubmit={handleCreateClient} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-[#C9A96A] mb-1">First Name</label>
                            <input type="text" value={createClientForm.first_name} onChange={(e) => setCreateClientForm({...createClientForm, first_name: e.target.value})} className="w-full p-3 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none focus:border-[#C9A96A]" required />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-[#C9A96A] mb-1">Last Name</label>
                            <input type="text" value={createClientForm.last_name} onChange={(e) => setCreateClientForm({...createClientForm, last_name: e.target.value})} className="w-full p-3 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none focus:border-[#C9A96A]" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-widest text-[#C9A96A] mb-1">Email Address</label>
                          <input type="email" value={createClientForm.email} onChange={(e) => setCreateClientForm({...createClientForm, email: e.target.value})} className="w-full p-3 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none focus:border-[#C9A96A]" required />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-widest text-[#C9A96A] mb-1">Temporary Password</label>
                          <input type="password" value={createClientForm.password} onChange={(e) => setCreateClientForm({...createClientForm, password: e.target.value})} className="w-full p-3 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none focus:border-[#C9A96A]" required minLength="6" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-widest text-[#C9A96A] mb-1">Assign Role</label>
                          <select value={createClientForm.role} onChange={(e) => setCreateClientForm({...createClientForm, role: e.target.value})} className="w-full p-3 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none focus:border-[#C9A96A]">
                            <option value="CUSTOMER">Standard User</option>
                            <option value="VENDOR">Boutique Vendor</option>
                            <option value="ADMIN">Super Admin</option>
                          </select>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <button type="button" onClick={() => setIsCreateClientModalOpen(false)} className="px-5 py-2 text-xs font-bold text-[#F5E6D3]/60 hover:text-white uppercase transition-colors">Cancel</button>
                          <button type="submit" className="px-6 py-2 text-xs font-black uppercase bg-[#C9A96A] hover:bg-[#B38D46] text-[#080808] rounded-full transition-colors">Create Account</button>
                        </div>
                      </form>
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
                  <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-[#C9A96A] border-t-transparent rounded-full animate-spin" /></div>
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
                                vendor.is_approved ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' : 'bg-amber-900/30 text-amber-400 border-amber-500/30'
                              }`}>
                                {vendor.is_approved ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                {vendor.is_approved ? 'Approved' : 'Pending'}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right">
                              <button onClick={() => toggleVendorApproval(vendor.id, vendor.is_approved)} className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold rounded-full transition-all border ${vendor.is_approved ? 'bg-red-900/20 hover:bg-red-900/40 text-red-400 border-red-500/30' : 'bg-[#C9A96A] hover:bg-[#B38D46] text-[#080808] border-[#C9A96A]'}`}>
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

            {/* --- CATEGORIES TAB --- */}
            {activeTab === 'categories' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif font-bold text-[#C9A96A]">Platform Categories</h2>
                  <button onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', slug: '', description: '', icon: '' }); setIsCategoryModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#C9A96A] hover:bg-[#B38D46] text-[#080808] rounded-full text-[10px] font-black uppercase tracking-widest transition-colors">
                    <Plus className="w-3 h-3" /> Add Category
                  </button>
                </div>
                {loading ? (
                  <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-[#C9A96A] border-t-transparent rounded-full animate-spin" /></div>
                ) : categories.length === 0 ? (
                  <div className="bg-[#080808] border border-[#C9A96A]/30 rounded-xl p-12 text-center">
                    <Layers className="w-10 h-10 text-[#C9A96A]/40 mx-auto mb-3" />
                    <p className="text-[#F5E6D3]/50 text-sm font-medium">No categories have been created yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[#F5E6D3]">
                      <thead className="bg-[#080808] text-[9px] uppercase tracking-[0.2em] text-[#C9A96A] border-b border-[#C9A96A]/30">
                        <tr>
                          <th className="py-4 px-5">Category Name</th>
                          <th className="py-4 px-5">URL Slug</th>
                          <th className="py-4 px-5">Status</th>
                          <th className="py-4 px-5 text-right">Moderation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C9A96A]/10">
                        {categories.map((cat) => (
                          <tr key={cat.id} className="hover:bg-[#080808]/50 transition-colors">
                            <td className="py-4 px-5 font-bold font-serif">{cat.name}</td>
                            <td className="py-4 px-5 text-xs font-mono text-[#F5E6D3]/70">{cat.slug}</td>
                            <td className="py-4 px-5">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-black border ${
                                cat.is_active ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' : 'bg-red-900/30 text-red-400 border-red-500/30'
                              }`}>
                                {cat.is_active ? 'Active' : 'Deactivated'}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right flex items-center justify-end gap-2">
                              <button onClick={() => openCategoryEditModal(cat)} className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold rounded-full transition-all border bg-[#111111] hover:bg-[#C9A96A] text-[#C9A96A] hover:text-[#080808] border-[#C9A96A]/50">
                                Edit
                              </button>
                              <button onClick={() => toggleCategoryActive(cat.id, cat.is_active)} className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold rounded-full transition-all border ${cat.is_active ? 'bg-red-900/20 hover:bg-red-900/40 text-red-400 border-red-500/30' : 'bg-[#C9A96A] hover:bg-[#B38D46] text-[#080808] border-[#C9A96A]'}`}>
                                {cat.is_active ? 'Disable' : 'Enable'}
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
                  <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-[#C9A96A] border-t-transparent rounded-full animate-spin" /></div>
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
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#080808] border border-[#C9A96A]/30 flex-shrink-0 flex items-center justify-center">
                                  {item.image_url ? (
                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <Package className="w-5 h-5 text-[#C9A96A]/20" />
                                  )}
                                </div>
                                <div>
                                  <span className="font-bold font-serif block">{item.name}</span>
                                  <span className="text-[10px] text-[#F5E6D3]/50 uppercase tracking-widest">{item.category_name}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-5 text-xs text-[#F5E6D3]/70">{item.vendor_name}</td>
                            <td className="py-4 px-5 font-mono text-[#C9A96A]">₹{item.base_price}</td>
                            <td className="py-4 px-5">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-black border ${
                                item.is_active ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' : 'bg-red-900/30 text-red-400 border-red-500/30'
                              }`}>
                                {item.is_active ? 'Visible' : 'Suspended'}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right flex items-center justify-end gap-2">
                              <button onClick={() => openEditModal(item)} className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold rounded-full transition-all border bg-[#111111] hover:bg-[#C9A96A] text-[#C9A96A] hover:text-[#080808] border-[#C9A96A]/50">
                                Edit
                              </button>
                              <button onClick={() => toggleProductActive(item.id, item.is_active)} className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold rounded-full transition-all border ${item.is_active ? 'bg-red-900/20 hover:bg-red-900/40 text-red-400 border-red-500/30' : 'bg-[#C9A96A] hover:bg-[#B38D46] text-[#080808] border-[#C9A96A]'}`}>
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

            {/* --- REVIEWS TAB --- */}
            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif font-bold text-[#C9A96A]">Review Moderation</h2>
                  <span className="px-3 py-1 bg-[#C9A96A]/10 text-[#C9A96A] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#C9A96A]/30">
                    {reviews.length} Reviews
                  </span>
                </div>
                {loading ? (
                  <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-[#C9A96A] border-t-transparent rounded-full animate-spin" /></div>
                ) : reviews.length === 0 ? (
                  <div className="bg-[#080808] border border-[#C9A96A]/30 rounded-xl p-12 text-center">
                    <Star className="w-10 h-10 text-[#C9A96A]/40 mx-auto mb-3" />
                    <p className="text-[#F5E6D3]/50 text-sm font-medium">No reviews left by customers yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[#F5E6D3]">
                      <thead className="bg-[#080808] text-[9px] uppercase tracking-[0.2em] text-[#C9A96A] border-b border-[#C9A96A]/30">
                        <tr>
                          <th className="py-4 px-5">Piece</th>
                          <th className="py-4 px-5">Rating & Review</th>
                          <th className="py-4 px-5">Client</th>
                          <th className="py-4 px-5 text-right">Moderation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C9A96A]/10">
                        {reviews.map((review) => (
                          <tr key={review.id} className={`hover:bg-[#080808]/50 transition-colors ${review.is_hidden ? 'opacity-40' : ''}`}>
                            <td className="py-4 px-5 font-bold font-serif">{review.product_name}</td>
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-1 mb-1 text-[#C9A96A]">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'opacity-30'}`} />
                                ))}
                              </div>
                              <p className="text-xs text-[#F5E6D3]/70 truncate max-w-xs">{review.comment}</p>
                            </td>
                            <td className="py-4 px-5 text-xs text-[#F5E6D3]/70">{review.user_email}</td>
                            <td className="py-4 px-5 text-right">
                              <button onClick={() => toggleReviewVisibility(review.id, review.is_hidden)} className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold rounded-full transition-all border ${!review.is_hidden ? 'bg-red-900/20 hover:bg-red-900/40 text-red-400 border-red-500/30' : 'bg-[#C9A96A] hover:bg-[#B38D46] text-[#080808] border-[#C9A96A]'}`}>
                                {!review.is_hidden ? <><EyeOff className="w-3 h-3 inline mr-1" /> Hide</> : <><Eye className="w-3 h-3 inline mr-1" /> Unhide</>}
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
                  <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-[#C9A96A] border-t-transparent rounded-full animate-spin" /></div>
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
                              ticket.status === 'RESOLVED' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' : 'bg-red-900/30 text-red-400 border-red-500/30'
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
                            <button onClick={() => resolveTicket(ticket.id)} className="px-4 py-2 text-[9px] uppercase tracking-widest font-black text-[#080808] bg-[#C9A96A] hover:bg-[#B38D46] rounded-full transition-colors">
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

            {/* --- ADD/EDIT CATEGORY MODAL --- */}
            {isCategoryModalOpen && (
              <div className="fixed inset-0 z-50 bg-[#080808]/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#111111] rounded-3xl max-w-md w-full p-8 border border-[#C9A96A]/30 shadow-2xl">
                  <h3 className="text-xl font-serif font-black text-[#C9A96A] mb-1">{editingCategory ? 'Edit Category' : 'Create Category'}</h3>
                  <form onSubmit={handleSaveCategory} className="space-y-4 mt-6">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-[#C9A96A] mb-1">Category Name</label>
                      <input type="text" value={categoryForm.name} onChange={handleCategoryNameChange} className="w-full p-3 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none" required />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-[#C9A96A] mb-1">URL Slug</label>
                      <input type="text" value={categoryForm.slug} onChange={(e) => setCategoryForm({...categoryForm, slug: e.target.value})} className="w-full p-3 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3]/50 rounded-xl outline-none" required />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-[#C9A96A] mb-1">Icon Name (Optional)</label>
                      <input type="text" value={categoryForm.icon} onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})} className="w-full p-3 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none" placeholder="e.g. Smartphone, Watch" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-[#C9A96A] mb-1">Description (Optional)</label>
                      <textarea value={categoryForm.description} onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})} className="w-full p-3 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none resize-none h-24" />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button type="button" onClick={() => { setIsCategoryModalOpen(false); setEditingCategory(null); }} className="px-5 py-2 text-xs font-bold text-[#F5E6D3]/60 hover:text-white uppercase transition-colors">Cancel</button>
                      <button type="submit" className="px-6 py-2 text-xs font-black uppercase bg-[#C9A96A] hover:bg-[#B38D46] text-[#080808] rounded-full transition-colors">Save</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* --- EDIT ORDER MODAL --- */}
            {editingOrder && (
              <div className="fixed inset-0 z-50 bg-[#080808]/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#111111] rounded-3xl max-w-md w-full p-8 border border-[#C9A96A]/30 shadow-2xl">
                  <h3 className="text-xl font-serif font-black text-[#C9A96A] mb-1">Update Order Status</h3>
                  <p className="text-[10px] uppercase tracking-widest text-[#F5E6D3]/50 mb-6">Ref #{editingOrder.id}</p>
                  <form onSubmit={handleSaveOrderEdit} className="space-y-4">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-[#C9A96A] mb-2">Payment / Processing Status</label>
                      <select value={orderEditForm.status} onChange={(e) => setOrderEditForm({ status: e.target.value })} className="w-full p-3 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none focus:border-[#C9A96A]">
                        <option value="PENDING">Pending (Awaiting Payment)</option>
                        <option value="PAID">Paid (Processing / Shipping)</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button type="button" onClick={() => setEditingOrder(null)} className="px-5 py-2 text-xs font-bold text-[#F5E6D3]/60 hover:text-white uppercase transition-colors">Cancel</button>
                      <button type="submit" className="px-6 py-2 text-xs font-black uppercase bg-[#C9A96A] hover:bg-[#B38D46] text-[#080808] rounded-full transition-colors">Force Save</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* --- EDIT PRODUCT MODAL --- */}
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

            {/* --- EDIT CLIENT MODAL --- */}
            {editingClient && (
              <div className="fixed inset-0 z-50 bg-[#080808]/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#111111] rounded-3xl max-w-md w-full p-8 border border-[#C9A96A]/30 shadow-2xl">
                  <h3 className="text-xl font-serif font-black text-[#C9A96A] mb-1">Override Client Identity</h3>
                  <p className="text-[10px] uppercase tracking-widest text-[#F5E6D3]/50 mb-6">Account: {editingClient.email}</p>
                  <form onSubmit={handleSaveClientEdit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-[#C9A96A] mb-1">First Name</label>
                        <input type="text" value={clientEditForm.first_name} onChange={(e) => setClientEditForm({...clientEditForm, first_name: e.target.value})} className="w-full p-3 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none focus:border-[#C9A96A]" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-[#C9A96A] mb-1">Last Name</label>
                        <input type="text" value={clientEditForm.last_name} onChange={(e) => setClientEditForm({...clientEditForm, last_name: e.target.value})} className="w-full p-3 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none focus:border-[#C9A96A]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-[#C9A96A] mb-1">Email Address</label>
                      <input type="email" value={clientEditForm.email} onChange={(e) => setClientEditForm({...clientEditForm, email: e.target.value})} className="w-full p-3 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none focus:border-[#C9A96A]" required />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-[#C9A96A] mb-1">Override Password</label>
                      <input type="password" value={clientEditForm.password} onChange={(e) => setClientEditForm({...clientEditForm, password: e.target.value})} placeholder="Leave blank to keep current password" className="w-full p-3 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none focus:border-[#C9A96A] placeholder:text-[#F5E6D3]/20" />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button type="button" onClick={() => setEditingClient(null)} className="px-5 py-2 text-xs font-bold text-[#F5E6D3]/60 hover:text-white uppercase transition-colors">Cancel</button>
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