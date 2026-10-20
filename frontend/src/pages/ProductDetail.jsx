// src/pages/ProductDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  Star,
  ShieldCheck,
  Truck,
  ShoppingCart,
  Check,
  Store,
  ArrowLeft,
  Edit3,
  Save,
  X,
  Trash2,
  ImagePlus,
  Crown,
  Layers,
  Plus,
} from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  // Vendor editing state
  const [isEditing, setIsEditing] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(false);

  // Variant form state
  const [variantForm, setVariantForm] = useState({
    name: "",
    additional_price: "0",
    stock: "10",
  });
  const [variantLoading, setVariantLoading] = useState(false);

  // Basic info form state
  const [editForm, setEditForm] = useState({
    name: "",
    base_price: "",
    discount_price: "",
    stock: "",
    description: "",
  });

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const [productRes, reviewRes] = await Promise.all([
        api.get(`store/products/${id}/`),
        api.get(`store/reviews/?product=${id}`),
      ]);
      setProduct(productRes.data);
      setReviews(reviewRes.data);

      const defaultImg =
        productRes.data.images?.find((img) => img.is_primary)?.image_url ||
        productRes.data.images?.[0]?.image_url ||
        "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600";
      setSelectedImage(defaultImg);

      if (productRes.data.variants?.length > 0) {
        setSelectedVariant(productRes.data.variants[0]);
      }

      setEditForm({
        name: productRes.data.name,
        base_price: productRes.data.base_price,
        discount_price: productRes.data.discount_price || "",
        stock: productRes.data.stock,
        description: productRes.data.description,
      });
    } catch (err) {
      console.error("Error fetching product details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProductEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`store/products/${id}/`, {
        name: editForm.name,
        base_price: editForm.base_price,
        discount_price: editForm.discount_price || null,
        stock: editForm.stock,
        description: editForm.description,
      });
      setProduct(res.data);
      setIsEditing(false);
      alert("Product details updated successfully!");
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update product details.");
    }
  };

  // --- IMAGE MANAGEMENT ---
  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    setImageLoading(true);
    try {
      await api.post(`store/products/${id}/images/`, {
        image_url: newImageUrl.trim(),
        is_primary: product.images?.length === 0,
      });
      setNewImageUrl("");
      await fetchProductDetails();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add image.");
    } finally {
      setImageLoading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await api.delete(`store/products/${id}/images/${imageId}/`);
      await fetchProductDetails();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete image.");
    }
  };

  const handleSetPrimary = async (imageId) => {
    try {
      await api.post(`store/products/${id}/images/${imageId}/set-primary/`);
      await fetchProductDetails();
    } catch (err) {
      alert("Failed to set primary image.");
    }
  };

  // --- VARIANT MANAGEMENT ---
  const handleAddVariant = async (e) => {
    e.preventDefault();
    if (!variantForm.name.trim()) return;
    setVariantLoading(true);
    try {
      await api.post(`store/products/${id}/variants/`, {
        name: variantForm.name.trim(),
        additional_price: parseFloat(variantForm.additional_price) || 0,
        stock: parseInt(variantForm.stock, 10) || 0,
      });
      setVariantForm({ name: "", additional_price: "0", stock: "10" });
      await fetchProductDetails();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add variant.");
    } finally {
      setVariantLoading(false);
    }
  };

  const handleDeleteVariant = async (variantId) => {
    if (!window.confirm("Delete this variant?")) return;
    try {
      await api.delete(`store/products/${id}/variants/${variantId}/`);
      await fetchProductDetails();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete variant.");
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    const itemToAdd = {
      ...product,
      variant: selectedVariant,
      price: selectedVariant
        ? Number(product.effective_price) +
          Number(selectedVariant.additional_price || 0)
        : Number(product.effective_price),
    };
    addToCart(itemToAdd);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800">Product not found</h2>
        <Link
          to="/"
          className="text-indigo-600 text-sm mt-3 inline-block font-semibold"
        >
          ← Return to Marketplace
        </Link>
      </div>
    );
  }

  // --- OWNERSHIP EVALUATION (Executed safely after product has loaded) ---
  const isVendor = user?.role === "VENDOR";
  const isOwner =
    isVendor &&
    Boolean(user?.id) &&
    Boolean(product?.vendor_user_id) &&
    Number(user?.id) === Number(product?.vendor_user_id);
  const isOtherVendor = isVendor && !isOwner;

  const activePrice = selectedVariant
    ? Number(product.effective_price) +
      Number(selectedVariant.additional_price || 0)
    : Number(product.effective_price);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        {/* Left: Product Images & Image Manager */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 relative group">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Customer Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 relative ${
                    selectedImage === img.image_url
                      ? "border-indigo-600 scale-95 shadow-sm"
                      : "border-gray-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                  {img.is_primary && (
                    <span className="absolute top-0.5 right-0.5 bg-amber-500 text-white rounded p-0.5 shadow">
                      <Crown className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* VENDOR PHOTO STRIP (Only visible to OWNER in edit mode) */}
          {isOwner && isEditing && (
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <ImagePlus className="w-4 h-4 text-emerald-600" /> Manage
                Product Photos
              </h4>

              <form onSubmit={handleAddImage} className="flex gap-2">
                <input
                  type="url"
                  placeholder="Paste image URL (https://...)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={imageLoading || !newImageUrl}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 shadow-sm"
                >
                  {imageLoading ? "Adding..." : "Add Photo"}
                </button>
              </form>

              <div className="divide-y divide-gray-200 pt-2">
                {product.images?.map((img) => (
                  <div
                    key={img.id}
                    className="py-2 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={img.image_url}
                        alt="pic"
                        className="w-8 h-8 rounded object-cover border border-gray-200"
                      />
                      <span className="truncate max-w-[140px] text-gray-500 text-[11px]">
                        {img.image_url}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {!img.is_primary ? (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(img.id)}
                          className="px-2 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded flex items-center gap-1 transition-colors"
                        >
                          <Crown className="w-3 h-3" /> Make Primary
                        </button>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded">
                          Primary
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.id)}
                        className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Product Details, Price & Variants */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              <span>{product.category_name}</span>
              <span className="flex items-center gap-1 text-emerald-600 font-semibold lowercase">
                <Store className="w-3.5 h-3.5" /> {product.vendor_name}
              </span>
            </div>

            {/* Title / Edit Title */}
            {isOwner && isEditing ? (
              <div className="mb-4">
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                  Product Title
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            ) : (
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                {product.name}
              </h1>
            )}

            {product.brand && (
              <p className="text-xs font-semibold text-gray-500 mt-1">
                Brand: {product.brand}
              </p>
            )}

            {/* Ratings */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.round(product.average_rating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-700">
                {product.average_rating || "No ratings"}
              </span>
              <span className="text-xs text-gray-400">
                ({reviews.length} reviews)
              </span>
            </div>

            {/* Pricing Section or In-place Editor */}
            {isOwner && isEditing ? (
              <div className="grid grid-cols-3 gap-3 my-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                    Base Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.base_price}
                    onChange={(e) =>
                      setEditForm({ ...editForm, base_price: e.target.value })
                    }
                    className="w-full p-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                    Discount Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.discount_price}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        discount_price: e.target.value,
                      })
                    }
                    className="w-full p-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                    Total Stock
                  </label>
                  <input
                    type="number"
                    value={editForm.stock}
                    onChange={(e) =>
                      setEditForm({ ...editForm, stock: e.target.value })
                    }
                    className="w-full p-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            ) : (
              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-3xl font-black text-gray-900">
                  ₹{activePrice.toFixed(2)}
                </span>
                {product.discount_price && (
                  <span className="text-sm font-semibold text-gray-400 line-through">
                    ₹{Number(product.base_price).toFixed(2)}
                  </span>
                )}
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    product.stock > 0
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} Available`
                    : "Sold Out"}
                </span>
              </div>
            )}

            {/* VARIANT MANAGER (Vendor Owner in Edit Mode) */}
            {isOwner && isEditing ? (
              <div className="mt-6 bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-600" /> Manage
                  Variants (Sizes, Colors, Storage)
                </h4>

                {/* Add Variant Form */}
                <form
                  onSubmit={handleAddVariant}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-2"
                >
                  <input
                    type="text"
                    required
                    placeholder="Variant (e.g. UK 8, 256GB)"
                    value={variantForm.name}
                    onChange={(e) =>
                      setVariantForm({ ...variantForm, name: e.target.value })
                    }
                    className="sm:col-span-2 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="+Price (₹)"
                    value={variantForm.additional_price}
                    onChange={(e) =>
                      setVariantForm({
                        ...variantForm,
                        additional_price: e.target.value,
                      })
                    }
                    className="px-2 py-1.5 text-xs bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={variantLoading || !variantForm.name}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </form>

                {/* Variant List Table */}
                {product.variants?.length > 0 && (
                  <div className="divide-y divide-gray-200 pt-2">
                    {product.variants.map((v) => (
                      <div
                        key={v.id}
                        className="py-2 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-gray-800">
                            {v.name}
                          </span>
                          {Number(v.additional_price) > 0 && (
                            <span className="ml-1 text-[11px] font-semibold text-emerald-600">
                              (+₹{Number(v.additional_price).toFixed(2)})
                            </span>
                          )}
                          <span className="ml-2 text-[10px] text-gray-400">
                            Stock: {v.stock}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteVariant(v.id)}
                          className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                          title="Delete variant"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* VARIANT SELECTOR (Read-only for other vendors, selectable for customers) */
              product.variants?.length > 0 && (
                <div className="mt-6">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                    Select Option
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => !isOtherVendor && setSelectedVariant(v)}
                        disabled={isOtherVendor}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedVariant?.id === v.id
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        } ${isOtherVendor ? "cursor-default opacity-80 hover:border-gray-200" : ""}`}
                      >
                        {v.name}{" "}
                        {Number(v.additional_price) > 0 &&
                          `(+₹${Number(v.additional_price)})`}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}

            {/* Description */}
            <div className="mt-6 border-t border-gray-100 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Description
              </h3>
              {isOwner && isEditing ? (
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              ) : (
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              )}
            </div>
          </div>

          {/* Action Footer: Owner Vendor vs Other Vendor vs Customer */}
          <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
            {isOwner ? (
              /* 1. OWNER VENDOR: Edit Controls */
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-emerald-900">
                    Your Store Listing
                  </h4>
                  <p className="text-[11px] text-emerald-700">
                    Modify photos, variants, prices, and specifications.
                  </p>
                </div>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                    <button
                      onClick={handleSaveProductEdit}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Changes
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Edit3 className="w-4 h-4" /> Edit Listing, Photos & Variants
                  </button>
                )}
              </div>
            ) : isOtherVendor ? (
              /* 2. OTHER VENDOR: Read-Only Store Notice */
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl text-center">
                <p className="text-xs font-semibold text-gray-700">
                  Listed by <strong>{product.vendor_name}</strong>
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  You are logged in as a vendor. You cannot edit or purchase
                  items from another seller's store.
                </p>
              </div>
            ) : (
              /* 3. CUSTOMER / GUEST: Add To Cart */
              <>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`w-full py-3.5 px-6 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                    added
                      ? "bg-emerald-600 text-white"
                      : product.stock > 0
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-5 h-5" /> Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" /> Add to Shopping Cart
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 pt-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>Insured Delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Direct Vendor Warranty</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}