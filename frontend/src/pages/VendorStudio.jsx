// src/pages/VendorStudio.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
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
  Power,
  X,
} from "lucide-react";

export default function VendorStudio() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("catalog"); // 'catalog' | 'orders'
  const [vendorProfile, setVendorProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fulfillment Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [fulfillmentForm, setFulfillmentForm] = useState({
    status: "PROCESSING",
    tracking_carrier: "",
    tracking_number: "",
  });

  // Product Add Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    brand: "",
    sku: "",
    base_price: "",
    discount_price: "",
    stock: "10",
    description: "",
  });

  useEffect(() => {
    fetchVendorStudioData();
  }, [user]);

  const fetchVendorStudioData = async () => {
    setLoading(true);
    try {
      // 1. Fetch vendor profile
      try {
        const meRes = await api.get("store/vendors/me/");
        setVendorProfile(meRes.data);
      } catch (err) {
        console.warn("store/vendors/me/ failed, attempting fallback:", err);
        try {
          const allRes = await api.get("store/vendors/");
          const profile = allRes.data?.find(
            (v) =>
              Number(v.user) === Number(user?.id) ||
              v.user_email === user?.email,
          );
          setVendorProfile(profile || null);
        } catch (fallbackErr) {
          console.error("Vendor profile fallback failed:", fallbackErr);
        }
      }

      // 2. Fetch products independently
      try {
        const prodRes = await api.get("store/products/?my_products=true");
        setProducts(prodRes.data || []);
      } catch (err) {
        console.error("Failed to load vendor products:", err);
        setProducts([]);
      }

      // 3. Fetch incoming orders independently
      try {
        const ordersRes = await api.get("store/vendor/orders/");
        setOrders(ordersRes.data || []);
      } catch (err) {
        console.error("Failed to load vendor incoming orders:", err);
        setOrders([]);
      }

      // 4. Fetch categories independently (for modal only)
      try {
        const catRes = await api.get("store/categories/");
        setCategories(catRes.data || []);
      } catch (err) {
        console.warn("Failed to load categories:", err);
        setCategories([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProductStatus = async (productId) => {
    try {
      const res = await api.patch(`store/vendor/products/${productId}/toggle-status/`);
      const newStatus = res.data.is_active;
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, is_active: newStatus } : p))
      );
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update product status.");
    }
  };

  const handleOpenFulfillment = (item) => {
    setSelectedOrder(item);
    setFulfillmentForm({
      status: item.status || "CONFIRMED",
      tracking_carrier: item.tracking_carrier || "",
      tracking_number: item.tracking_number || "",
    });
  };

  const handleUpdateFulfillment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("store/vendor/fulfillment/update/", {
        item_id: selectedOrder.id,
        status: fulfillmentForm.status,
        tracking_carrier: fulfillmentForm.tracking_carrier,
        tracking_number: fulfillmentForm.tracking_number,
      });

      setOrders((prev) =>
        prev.map((ord) =>
          ord.id === selectedOrder.id
            ? {
                ...ord,
                status: res.data.status,
                tracking_carrier: res.data.tracking_carrier,
                tracking_number: res.data.tracking_number,
              }
            : ord,
        ),
      );

      setSelectedOrder(null);
      alert(`Item status updated to ${res.data.status}`);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update order tracking.");
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post("store/products/", {
        ...productForm,
        slug: productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      });
      setShowProductModal(false);
      fetchVendorStudioData();
      alert("Product created successfully!");
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create product.");
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-[#faf8f5]/40 min-h-screen">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-amber-100/80 gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-stone-900">
              {vendorProfile?.store_name || "Artisan Studio"}
            </h1>
            {vendorProfile?.is_approved ? (
              <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Certified
              </span>
            ) : (
              <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-800 border border-amber-200 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Under Review
              </span>
            )}
          </div>
          <p className="text-xs uppercase tracking-widest font-semibold text-amber-800/60 mt-2">
            Manage your fine jewelry collection and fulfill secure orders.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-stone-100 p-1.5 rounded-2xl border border-stone-200 shadow-inner">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === "catalog" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-900"
            }`}
          >
            <Package className="w-4 h-4" /> Vault ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === "orders" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-900"
            }`}
          >
            <ClipboardList className="w-4 h-4" /> Dispatches ({orders.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: CATALOG MANAGEMENT */}
      {activeTab === "catalog" && (
        <div className="mt-8 bg-white rounded-[2rem] border border-amber-100/60 shadow-xl shadow-amber-900/5 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-amber-100/60 flex items-center justify-between bg-[#fcfaf7]">
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-900">Atelier Inventory</h2>
              <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mt-1">Publish or archive your creations.</p>
            </div>
            <button
              onClick={() => setShowProductModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-extrabold text-[10px] uppercase tracking-widest px-5 py-3 rounded-full transition-all shadow-md shadow-amber-600/20"
            >
              <Plus className="w-4 h-4" /> Add Piece
            </button>
          </div>

          {products.length === 0 ? (
            <div className="p-16 text-center">
              <Package className="w-12 h-12 text-amber-200 mx-auto mb-4" />
              <p className="text-sm font-medium text-stone-400">The vault is currently empty.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600 font-medium">
                <thead className="bg-stone-50/50 uppercase text-[9px] font-black tracking-[0.2em] text-stone-400 border-b border-amber-100">
                  <tr>
                    <th className="py-4 px-6">Creation</th>
                    <th className="py-4 px-6">Classification</th>
                    <th className="py-4 px-6">Value</th>
                    <th className="py-4 px-6">Vault</th>
                    <th className="py-4 px-6 text-center">Visibility</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-50">
                  {products.map((p) => {
                    const imgUrl = p.primary_image || p.images?.[0]?.image_url;
                    const isActive = p.is_active !== false;

                    return (
                      <tr
                        key={p.id}
                        className={`transition-colors ${
                          isActive ? "hover:bg-amber-50/30" : "bg-stone-50/40 opacity-75"
                        }`}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#fcfaf7] rounded-xl overflow-hidden flex items-center justify-center border border-amber-100/50 flex-shrink-0">
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt={p.name}
                                  className={`w-full h-full object-cover ${
                                    !isActive ? "grayscale contrast-75" : ""
                                  }`}
                                />
                              ) : (
                                <Package className="w-5 h-5 text-amber-200" />
                              )}
                            </div>
                            <div>
                              <span className="font-serif font-bold text-stone-900 text-sm block">
                                {p.name}
                              </span>
                              <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                                Ref: {p.sku || "N/A"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 font-semibold uppercase tracking-wider text-[10px]">{p.category_name || "General"}</td>

                        <td className="py-4 px-6 font-black text-amber-700 text-sm">
                          ₹{Number(p.effective_price || p.base_price).toFixed(2)}
                        </td>

                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-full font-black uppercase tracking-widest text-[9px] bg-stone-100 text-stone-600 border border-stone-200">
                            {p.stock} Units
                          </span>
                        </td>

                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-black border shadow-sm ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isActive ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                            />
                            {isActive ? "Displayed" : "Archived"}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleProductStatus(p.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all border shadow-sm ${
                              isActive
                                ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                            }`}
                            title={isActive ? "Archive Piece" : "Publish Piece"}
                          >
                            <Power className="w-3.5 h-3.5" />
                            {isActive ? "Archive" : "Publish"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: INCOMING ORDERS & DISPATCH */}
      {activeTab === "orders" && (
        <div className="mt-8 bg-white rounded-[2rem] border border-amber-100/60 shadow-xl shadow-amber-900/5 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-amber-100/60 flex items-center justify-between bg-[#fcfaf7]">
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-900">
                Pending Dispatches
              </h2>
              <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mt-1">
                Provide insured logistics details for your clients.
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 bg-amber-100/50 text-amber-800 rounded-full border border-amber-200">
              {orders.length} Acquisition{orders.length === 1 ? "" : "s"}
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="p-16 text-center">
              <ClipboardList className="w-12 h-12 text-amber-200 mx-auto mb-4" />
              <p className="text-sm font-medium text-stone-400">
                No active acquisitions at this time.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-amber-50">
              {orders.map((item) => (
                <div
                  key={item.id}
                  className="p-6 sm:p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:bg-amber-50/20 transition-colors"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 bg-[#fcfaf7] rounded-2xl overflow-hidden flex items-center justify-center border border-amber-100/50 flex-shrink-0 shadow-inner">
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-amber-200" />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-stone-900 tracking-wider">
                          Ref #{item.order_id}
                        </span>
                        <span
                          className={`text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest shadow-sm ${
                            item.status === "DELIVERED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : item.status === "SHIPPED" ||
                                item.status === "OUT_FOR_DELIVERY"
                              ? "bg-amber-100 text-amber-900 border-amber-300"
                              : "bg-stone-100 text-stone-700 border-stone-200"
                          }`}
                        >
                          {item.status || "CONFIRMED"}
                        </span>
                      </div>

                      <h4 className="text-base font-serif font-bold text-stone-900">
                        {item.quantity}x {item.product_name}{" "}
                        {item.variant_name && <span className="text-amber-700 text-sm">({item.variant_name})</span>}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-stone-500 pt-1">
                        <span className="flex items-center gap-1.5 text-stone-700">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          {item.shipping_full_name}, {item.shipping_city} (
                          {item.shipping_pincode})
                        </span>
                        <span className="text-amber-200">•</span>
                        <span>
                          Phone: <strong className="text-stone-700">{item.shipping_phone}</strong>
                        </span>
                        <span className="text-amber-200">•</span>
                        <span>Client: {item.customer_email}</span>
                      </div>

                      {(item.tracking_carrier || item.tracking_number) && (
                        <div className="flex items-center gap-2 pt-2 text-[10px] font-bold uppercase tracking-widest text-amber-800">
                          <Truck className="w-3.5 h-3.5 text-amber-600" />
                          <span>
                            Carrier: {item.tracking_carrier || "Standard"} —
                            Tracking #{" "}
                            <span className="font-mono text-stone-900 tracking-widest">
                              {item.tracking_number}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={() => handleOpenFulfillment(item)}
                      className="px-5 py-2.5 bg-white hover:bg-stone-50 text-stone-700 text-[10px] uppercase tracking-widest font-black rounded-full transition-colors flex items-center gap-2 shadow-sm border border-stone-200"
                    >
                      <Truck className="w-4 h-4 text-amber-600" />
                      Update Logistics
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
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] max-w-md w-full p-8 shadow-2xl border border-amber-100/60">
            <h3 className="text-xl font-serif font-black text-stone-900 mb-1">
              Dispatch Ref #{selectedOrder.order_id}
            </h3>
            <p className="text-xs text-stone-500 mb-6 font-medium">
              Update secure logistics for:{" "}
              <strong className="text-stone-800">{selectedOrder.product_name}</strong>
            </p>

            <form
              onSubmit={handleUpdateFulfillment}
              className="space-y-5 text-sm"
            >
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">
                  Transit Status
                </label>
                <select
                  value={fulfillmentForm.status}
                  onChange={(e) =>
                    setFulfillmentForm({
                      ...fulfillmentForm,
                      status: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 bg-stone-50 font-medium text-stone-800 transition-colors"
                >
                  <option value="PROCESSING">Artisan Processing</option>
                  <option value="SHIPPED">Handed to Secure Carrier</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered to Client</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">
                  Logistics Partner
                </label>
                <input
                  type="text"
                  placeholder="e.g. BlueDart, FedEx Secure"
                  value={fulfillmentForm.tracking_carrier}
                  onChange={(e) =>
                    setFulfillmentForm({
                      ...fulfillmentForm,
                      tracking_carrier: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 bg-stone-50 font-medium text-stone-900 placeholder:text-stone-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">
                  AWB / Tracking Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. BLU198273645IN"
                  value={fulfillmentForm.tracking_number}
                  onChange={(e) =>
                    setFulfillmentForm({
                      ...fulfillmentForm,
                      tracking_number: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 font-mono tracking-widest bg-stone-50 font-medium text-stone-900 placeholder:text-stone-400 transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-50/50">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-stone-500 hover:bg-stone-100 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white bg-stone-900 hover:bg-stone-800 rounded-full shadow-md transition-all"
                >
                  Save Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-[70] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] max-w-lg w-full p-8 shadow-2xl border border-amber-100/60 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-serif font-black text-stone-900 mb-6">
              Catalog a New Creation
            </h3>
            <form onSubmit={handleCreateProduct} className="space-y-4 text-sm">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">
                  Collection Title
                </label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  placeholder="e.g. 24K Gold Pearl Necklace"
                  className="w-full p-3 border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 bg-stone-50 text-stone-900 placeholder:text-stone-400 transition-colors font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">
                    Category
                  </label>
                  <select
                    required
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 bg-stone-50 text-stone-900 transition-colors font-medium"
                  >
                    <option value="">Select Classification</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">
                    Ref / SKU
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) =>
                      setProductForm({ ...productForm, sku: e.target.value })
                    }
                    placeholder="GLD-001"
                    className="w-full p-3 border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 bg-stone-50 font-mono tracking-wider text-stone-900 placeholder:text-stone-400 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">
                    Base Value (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.base_price}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        base_price: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 bg-stone-50 text-stone-900 font-medium transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">
                    Offer Value (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.discount_price}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        discount_price: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 bg-stone-50 text-stone-900 font-medium transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">
                    Vault Stock
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) =>
                      setProductForm({ ...productForm, stock: e.target.value })
                    }
                    className="w-full p-3 border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 bg-stone-50 text-stone-900 font-medium transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">
                  Hallmark / Brand
                </label>
                <input
                  type="text"
                  value={productForm.brand}
                  onChange={(e) =>
                    setProductForm({ ...productForm, brand: e.target.value })
                  }
                  placeholder="Atelier Signature"
                  className="w-full p-3 border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 bg-stone-50 text-stone-900 placeholder:text-stone-400 transition-colors font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">
                  Craftsmanship Details
                </label>
                <textarea
                  rows={3}
                  required
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe the cut, clarity, and materials..."
                  className="w-full p-3 border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 bg-stone-50 text-stone-900 placeholder:text-stone-400 transition-colors font-medium leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-50/50">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-stone-500 hover:bg-stone-100 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 rounded-full shadow-md shadow-amber-600/20 transition-all"
                >
                  Publish Creation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}