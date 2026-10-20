// src/pages/VendorStudio.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  Plus, 
  Trash2, 
  Truck, 
  Store, 
  CheckCircle2, 
  AlertTriangle,
  ClipboardList,
  MapPin,
  ExternalLink,
  Edit3
} from 'lucide-react';

export default function VendorStudio() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'orders'
  const [vendorProfile, setVendorProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fulfillment Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [fulfillmentForm, setFulfillmentForm] = useState({
    status: 'PROCESSING',
    tracking_carrier: '',
    tracking_number: '',
  });

  // Product Add Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    brand: '',
    sku: '',
    base_price: '',
    discount_price: '',
    stock: '10',
    description: '',
  });

  useEffect(() => {
    fetchVendorStudioData();
  }, []);


  // Inside src/pages/VendorStudio.jsx -> fetchVendorStudioData
// src/pages/VendorStudio.jsx

const fetchVendorStudioData = async () => {
  setLoading(true);
  try {
    // 1. Fetch vendor profile (with fallback)
    let profileData = null;
    try {
      const meRes = await api.get('store/vendors/me/');
      profileData = meRes.data;
    } catch (err) {
      // Fallback: search through vendors list by current user ID
      const allRes = await api.get('store/vendors/');
      profileData = allRes.data.find(
        (v) => Number(v.user) === Number(user?.id) || v.user_email === user?.email
      );
    }

    setVendorProfile(profileData);

    // 2. Fetch only this vendor's items
    const prodRes = await api.get('store/products/?my_products=true');
    setProducts(prodRes.data);
  } catch (err) {
    console.error('Failed to load studio data:', err);
  } finally {
    setLoading(false);
  }
};

  const handleOpenFulfillment = (item) => {
    setSelectedOrder(item);
    setFulfillmentForm({
      status: item.order_status,
      tracking_carrier: '',
      tracking_number: '',
    });
  };

  const handleUpdateFulfillment = async (e) => {
    e.preventDefault();
    try {
      await api.post('store/vendor/fulfillment/update/', {
        order_id: selectedOrder.order_id,
        status: fulfillmentForm.status,
        tracking_carrier: fulfillmentForm.tracking_carrier,
        tracking_number: fulfillmentForm.tracking_number,
      });

      setSelectedOrder(null);
      fetchVendorStudioData();
      alert(`Order #${selectedOrder.order_id} fulfillment updated!`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update order tracking.');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('store/products/', {
        ...productForm,
        slug: productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      });
      setShowProductModal(false);
      fetchVendorStudioData();
      alert('Product created successfully!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create product.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`store/products/${id}/`);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      alert('Failed to delete product.');
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Vendor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-gray-900">{vendorProfile?.store_name || 'Vendor Studio'}</h1>
            {vendorProfile?.is_approved ? (
              <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Approved
              </span>
            ) : (
              <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Pending Verification
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">Manage product inventory and dispatch pending customer parcels.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'catalog'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Package className="w-4 h-4" /> Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <ClipboardList className="w-4 h-4" /> Incoming Orders ({orders.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: CATALOG MANAGEMENT */}
      {activeTab === 'catalog' && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800">Live Inventory</h2>
            <button
              onClick={() => setShowProductModal(true)}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Product
            </button>
          </div>

          {products.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-xs text-gray-400">No products uploaded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 uppercase text-[10px] tracking-wider text-gray-400 border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 px-4 font-bold text-gray-900">{p.name}</td>
                      <td className="py-3 px-4">{p.category_name}</td>
                      <td className="py-3 px-4 font-bold text-indigo-600">₹{Number(p.effective_price).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-50 text-emerald-700">
                          {p.stock} units
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="text-gray-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* VIEW 2: INCOMING ORDERS & DISPATCH */}
      {activeTab === 'orders' && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-800">Orders Awaiting Dispatch & Tracking</h2>
            <p className="text-xs text-gray-400 mt-0.5">Update shipping carriers so customers can track their parcel delivery.</p>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-xs text-gray-400">No customer orders received yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.map((item) => (
                <div key={item.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-gray-50/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-gray-900">Order #{item.order_id}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                        {item.order_status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-gray-900">
                      {item.quantity}x {item.product_name} {item.variant_name && `(${item.variant_name})`}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {item.shipping_full_name}, {item.shipping_city} ({item.shipping_pincode})
                      </span>
                      <span>•</span>
                      <span>Phone: <strong>{item.shipping_phone}</strong></span>
                      <span>•</span>
                      <span>Customer: {item.customer_email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleOpenFulfillment(item)}
                      className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Truck className="w-4 h-4" />
                      Update Tracking & Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FULFILLMENT / TRACKING MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Dispatch Order #{selectedOrder.order_id}
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Enter courier details for: <strong>{selectedOrder.product_name}</strong>
            </p>

            <form onSubmit={handleUpdateFulfillment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-gray-500 mb-1">Fulfillment Status</label>
                <select
                  value={fulfillmentForm.status}
                  onChange={(e) => setFulfillmentForm({ ...fulfillmentForm, status: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="PROCESSING">Processing / Packing</option>
                  <option value="SHIPPED">Handed over to Courier (Shipped)</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase text-gray-500 mb-1">Shipping Carrier</label>
                <input
                  type="text"
                  placeholder="e.g. BlueDart, Delhivery, DTDC, India Post"
                  value={fulfillmentForm.tracking_carrier}
                  onChange={(e) => setFulfillmentForm({ ...fulfillmentForm, tracking_carrier: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-gray-500 mb-1">Tracking / AWB Number</label>
                <input
                  type="text"
                  placeholder="e.g. BLU198273645IN"
                  value={fulfillmentForm.tracking_number}
                  onChange={(e) => setFulfillmentForm({ ...fulfillmentForm, tracking_number: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 font-semibold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
                >
                  Save Dispatch Info
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900 mb-3">Add Product to Store</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold uppercase text-gray-500 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Sneakers, Analog Watch, T-Shirt..."
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-gray-500 mb-1">Category</label>
                  <select
                    required
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase text-gray-500 mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="PROD-001"
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase text-gray-500 mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.base_price}
                    onChange={(e) => setProductForm({ ...productForm, base_price: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-gray-500 mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.discount_price}
                    onChange={(e) => setProductForm({ ...productForm, discount_price: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-gray-500 mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-gray-500 mb-1">Brand Name</label>
                <input
                  type="text"
                  value={productForm.brand}
                  onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                  placeholder="Brand"
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-gray-500 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 font-semibold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm"
                >
                  Publish Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}