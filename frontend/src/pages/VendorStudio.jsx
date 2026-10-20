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
  Edit3,
  RefreshCw,
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
  }, []);

  // Inside src/pages/VendorStudio.jsx
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
        item_id: selectedOrder.id, // Targets the specific item, not the parent order
        status: fulfillmentForm.status,
        tracking_carrier: fulfillmentForm.tracking_carrier,
        tracking_number: fulfillmentForm.tracking_number,
      });

      // Update state locally
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

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`store/products/${id}/`);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete product.");
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
            <h1 className="text-3xl font-extrabold text-gray-900">
              {vendorProfile?.store_name || "Vendor Studio"}
            </h1>
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
          <p className="text-xs text-gray-400 mt-1">
            Manage product inventory and dispatch pending customer parcels.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "catalog"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Package className="w-4 h-4" /> Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "orders"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <ClipboardList className="w-4 h-4" /> Incoming Orders (
            {orders.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: CATALOG MANAGEMENT */}
      {activeTab === "catalog" && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-800">Live Inventory</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Toggle products active or inactive to display or hide them from customer search.
              </p>
            </div>
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
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => {
                    const imgUrl = p.primary_image || p.images?.[0]?.image_url;
                    const isActive = p.is_active !== false;

                    return (
                      <tr
                        key={p.id}
                        className={`transition-colors ${
                          isActive ? "hover:bg-gray-50/50" : "bg-gray-50/40 opacity-75"
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {/* Product Thumbnail */}
                            <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200/60 flex-shrink-0">
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt={p.name}
                                  className={`w-full h-full object-cover ${
                                    !isActive ? "grayscale contrast-75" : ""
                                  }`}
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    e.currentTarget.parentElement.innerHTML =
                                      '<div class="w-full h-full flex items-center justify-center text-gray-400"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg></div>';
                                  }}
                                />
                              ) : (
                                <Package className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 block text-xs">
                                {p.name}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                SKU: {p.sku || "N/A"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {p.category_name || "General"}
                        </td>

                        <td className="py-3 px-4 font-bold text-indigo-600">
                          ₹{Number(p.effective_price || p.base_price).toFixed(2)}
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                            {p.stock} units
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
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
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Active / Deactivate Toggle Button */}
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleProductStatus(p.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              isActive
                                ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                            }`}
                            title={isActive ? "Deactivate Product" : "Activate Product"}
                          >
                            <Power className="w-3.5 h-3.5" />
                            {isActive ? "Deactivate" : "Activate"}
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
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-800">
                Orders Awaiting Dispatch & Tracking
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Update shipping carriers and tracking numbers so customers can
                monitor parcel deliveries.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
              {orders.length} Item{orders.length === 1 ? "" : "s"} Sold
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-xs text-gray-400">
                No customer orders received yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.map((item) => (
                <div
                  key={item.id}
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                >
                  {/* Left side: Thumbnail + Details */}
                  <div className="flex items-start gap-4">
                    {/* Order Item Image Thumbnail */}
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200/60 flex-shrink-0">
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement.innerHTML =
                              '<div class="w-full h-full flex items-center justify-center text-gray-400"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg></div>';
                          }}
                        />
                      ) : (
                        <Package className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-gray-900">
                          Order #{item.order_id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                            item.status === "DELIVERED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : item.status === "SHIPPED" ||
                                  item.status === "OUT_FOR_DELIVERY"
                                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {item.status || "CONFIRMED"}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-gray-900">
                        {item.quantity}x {item.product_name}{" "}
                        {item.variant_name && `(${item.variant_name})`}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          {item.shipping_full_name}, {item.shipping_city} (
                          {item.shipping_pincode})
                        </span>
                        <span>•</span>
                        <span>
                          Phone: <strong>{item.shipping_phone}</strong>
                        </span>
                        <span>•</span>
                        <span>Customer: {item.customer_email}</span>
                      </div>

                      {/* Tracking info if already added */}
                      {(item.tracking_carrier || item.tracking_number) && (
                        <div className="flex items-center gap-2 pt-1 text-xs text-indigo-700 font-semibold">
                          <Truck className="w-3.5 h-3.5 text-indigo-500" />
                          <span>
                            Carrier: {item.tracking_carrier || "Standard"} —
                            Tracking #{" "}
                            <span className="font-mono text-gray-900">
                              {item.tracking_number}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side: Action Button */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={() => handleOpenFulfillment(item)}
                      className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm border border-indigo-100"
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
              Enter courier details for:{" "}
              <strong>{selectedOrder.product_name}</strong>
            </p>

            <form
              onSubmit={handleUpdateFulfillment}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold uppercase text-gray-500 mb-1">
                  Fulfillment Status
                </label>
                <select
                  value={fulfillmentForm.status}
                  onChange={(e) =>
                    setFulfillmentForm({
                      ...fulfillmentForm,
                      status: e.target.value,
                    })
                  }
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="PROCESSING">Processing / Packing</option>
                  <option value="SHIPPED">
                    Handed over to Courier (Shipped)
                  </option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase text-gray-500 mb-1">
                  Shipping Carrier
                </label>
                <input
                  type="text"
                  placeholder="e.g. BlueDart, Delhivery, DTDC, India Post"
                  value={fulfillmentForm.tracking_carrier}
                  onChange={(e) =>
                    setFulfillmentForm({
                      ...fulfillmentForm,
                      tracking_carrier: e.target.value,
                    })
                  }
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-gray-500 mb-1">
                  Tracking / AWB Number
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
            <h3 className="text-base font-bold text-gray-900 mb-3">
              Add Product to Store
            </h3>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold uppercase text-gray-500 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  placeholder="Sneakers, Analog Watch, T-Shirt..."
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-gray-500 mb-1">
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
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase text-gray-500 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) =>
                      setProductForm({ ...productForm, sku: e.target.value })
                    }
                    placeholder="PROD-001"
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase text-gray-500 mb-1">
                    Base Price (₹)
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
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-gray-500 mb-1">
                    Discount Price (₹)
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
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-gray-500 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) =>
                      setProductForm({ ...productForm, stock: e.target.value })
                    }
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-gray-500 mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={productForm.brand}
                  onChange={(e) =>
                    setProductForm({ ...productForm, brand: e.target.value })
                  }
                  placeholder="Brand"
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-gray-500 mb-1">
                  Description
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
