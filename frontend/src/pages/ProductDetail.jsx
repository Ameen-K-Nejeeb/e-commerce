// src/pages/ProductDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Star, ShieldCheck, Truck, ShoppingCart, Check, Store, ArrowLeft, Edit3, Save, X, Trash2, ImagePlus, Crown, Layers, Plus } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

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
  const [variantForm, setVariantForm] = useState({ name: "", additional_price: "0", stock: "10" });
  const [variantLoading, setVariantLoading] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", base_price: "", discount_price: "", stock: "", description: "" });

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const [productRes, reviewRes] = await Promise.all([
        api.get(`store/products/${id}/`),
        api.get(`store/products/${id}/reviews/`), 
      ]);
      setProduct(productRes.data);
      setReviews(reviewRes.data);

      const defaultImg = productRes.data.images?.find((img) => img.is_primary)?.image_url || productRes.data.images?.[0]?.image_url || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600";
      setSelectedImage(defaultImg);
      if (productRes.data.variants?.length > 0) setSelectedVariant(productRes.data.variants[0]);

      setEditForm({ name: productRes.data.name, base_price: productRes.data.base_price, discount_price: productRes.data.discount_price || "", stock: productRes.data.stock, description: productRes.data.description });
    } catch (err) {
      console.error("Error fetching details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProductEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`store/products/${id}/`, {
        name: editForm.name, base_price: editForm.base_price, discount_price: editForm.discount_price || null, stock: editForm.stock, description: editForm.description,
      });
      setProduct(res.data);
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update product details.");
    }
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    setImageLoading(true);
    try {
      await api.post(`store/products/${id}/images/`, { image_url: newImageUrl.trim(), is_primary: product.images?.length === 0 });
      setNewImageUrl("");
      await fetchProductDetails();
    } catch (err) { alert("Failed to add image."); } finally { setImageLoading(false); }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("Remove this photo?")) return;
    try { await api.delete(`store/products/${id}/images/${imageId}/`); await fetchProductDetails(); } catch (err) { alert("Failed to delete image."); }
  };

  const handleSetPrimary = async (imageId) => {
    try { await api.post(`store/products/${id}/images/${imageId}/set-primary/`); await fetchProductDetails(); } catch (err) { alert("Failed to set primary."); }
  };

  const handleAddVariant = async (e) => {
    e.preventDefault();
    if (!variantForm.name.trim()) return;
    setVariantLoading(true);
    try {
      await api.post(`store/products/${id}/variants/`, { name: variantForm.name.trim(), additional_price: parseFloat(variantForm.additional_price) || 0, stock: parseInt(variantForm.stock, 10) || 0 });
      setVariantForm({ name: "", additional_price: "0", stock: "10" });
      await fetchProductDetails();
    } catch (err) { alert("Failed to add variant."); } finally { setVariantLoading(false); }
  };

  const handleDeleteVariant = async (variantId) => {
    if (!window.confirm("Remove this variant?")) return;
    try { await api.delete(`store/products/${id}/variants/${variantId}/`); await fetchProductDetails(); } catch (err) { alert("Failed to delete variant."); }
  };

  const handleAddToCart = () => {
    if (!user) { navigate("/login"); return; }
    if (!product) return;
    const itemToAdd = { ...product, variant: selectedVariant, price: selectedVariant ? Number(product.effective_price) + Number(selectedVariant.additional_price || 0) : Number(product.effective_price) };
    addToCart(itemToAdd);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (loading) {
    return (
      <div className="py-32 flex justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return <div className="text-center py-20"><h2 className="text-xl font-serif">Ornament Not Found</h2></div>;

  const isVendor = user?.role === "VENDOR";
  const isOwner = isVendor && Number(user?.id) === Number(product?.vendor_user_id);
  const isOtherVendor = isVendor && !isOwner;
  const activePrice = selectedVariant ? Number(product.effective_price) + Number(selectedVariant.additional_price || 0) : Number(product.effective_price);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#faf8f5]/30">
      <Link to="/" className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-amber-700 mb-8 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Collection
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 bg-white p-8 sm:p-12 rounded-[2.5rem] border border-amber-100/60 shadow-xl shadow-amber-900/5">
        
        {/* Left: Images */}
        <div className="space-y-5">
          <div className="aspect-square w-full rounded-[2rem] overflow-hidden bg-[#fcfaf7] border border-amber-100/50 shadow-inner relative">
            <img src={selectedImage} alt={product.name} className="w-full h-full object-cover object-center" />
          </div>

          {product.images?.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 relative ${
                    selectedImage === img.image_url ? "border-amber-500 scale-95 shadow-md shadow-amber-500/20" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img.image_url} alt="Thumb" className="w-full h-full object-cover" />
                  {img.is_primary && (
                    <span className="absolute top-1 right-1 bg-amber-500 text-white rounded-full p-0.5 shadow-sm">
                      <Crown className="w-3 h-3" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {isOwner && isEditing && (
            <div className="bg-amber-50/50 p-5 rounded-3xl border border-amber-200/60 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-800 flex items-center gap-2">
                <ImagePlus className="w-4 h-4 text-amber-600" /> Curate Gallery
              </h4>
              <form onSubmit={handleAddImage} className="flex gap-2">
                <input type="url" placeholder="High-res image URL..." value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} className="flex-1 px-4 py-2.5 text-xs bg-white text-stone-900 border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400 transition-all" />
                <button type="submit" disabled={imageLoading || !newImageUrl} className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm">Add</button>
              </form>
              <div className="divide-y divide-amber-100 pt-2">
                {product.images?.map((img) => (
                  <div key={img.id} className="py-2.5 flex items-center justify-between text-xs">
                    <img src={img.image_url} alt="pic" className="w-10 h-10 rounded-lg object-cover border border-amber-200" />
                    <div className="flex items-center gap-2">
                      {!img.is_primary ? (
                        <button onClick={() => handleSetPrimary(img.id)} className="px-2.5 py-1 text-[9px] uppercase tracking-widest font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"><Crown className="w-3 h-3 inline" /> Make Hero</button>
                      ) : (
                        <span className="px-2.5 py-1 text-[9px] uppercase tracking-widest font-bold text-emerald-800 bg-emerald-100 rounded-lg">Hero Image</span>
                      )}
                      <button onClick={() => handleDeleteImage(img.id)} className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-black text-amber-700/60 uppercase tracking-widest mb-3">
              <span>{product.category_name}</span>
              <span className="flex items-center gap-1.5 text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60">
                <Store className="w-3.5 h-3.5" /> {product.vendor_name}
              </span>
            </div>

            {isOwner && isEditing ? (
              <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full p-3 bg-stone-50 border border-amber-200 rounded-xl text-lg font-serif font-bold mb-4 outline-none focus:ring-2 focus:ring-amber-500" />
            ) : (
              <h1 className="text-3xl sm:text-4xl font-serif font-black text-stone-900 leading-tight">
                {product.name}
              </h1>
            )}

            {product.brand && <p className="text-xs font-bold tracking-widest uppercase text-stone-400 mt-2">Hallmark: {product.brand}</p>}

            <div className="flex items-center gap-2 mt-4">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.round(product.average_rating || 0) ? "fill-amber-400 text-amber-400" : "text-amber-100"}`} />)}
              </div>
              <span className="text-sm font-bold text-stone-700">{Number(product.average_rating) > 0 ? Number(product.average_rating).toFixed(1) : "Unrated"}</span>
              <span className="text-xs text-stone-400">({reviews.length} reviews)</span>
            </div>

            {isOwner && isEditing ? (
              <div className="grid grid-cols-3 gap-3 my-6 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60">
                <div><label className="block text-[9px] font-bold uppercase tracking-widest text-amber-800 mb-1">Base Price</label><input type="number" step="0.01" value={editForm.base_price} onChange={(e) => setEditForm({ ...editForm, base_price: e.target.value })} className="w-full p-2.5 text-xs rounded-xl border-amber-200 outline-none focus:ring-2 focus:ring-amber-500" /></div>
                <div><label className="block text-[9px] font-bold uppercase tracking-widest text-amber-800 mb-1">Discount Price</label><input type="number" step="0.01" value={editForm.discount_price} onChange={(e) => setEditForm({ ...editForm, discount_price: e.target.value })} className="w-full p-2.5 text-xs rounded-xl border-amber-200 outline-none focus:ring-2 focus:ring-amber-500" /></div>
                <div><label className="block text-[9px] font-bold uppercase tracking-widest text-amber-800 mb-1">Inventory</label><input type="number" value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} className="w-full p-2.5 text-xs rounded-xl border-amber-200 outline-none focus:ring-2 focus:ring-amber-500" /></div>
              </div>
            ) : (
              <div className="mt-8 flex items-baseline gap-4">
                <span className="text-4xl font-serif font-black text-stone-900">₹{activePrice.toFixed(2)}</span>
                {product.discount_price && <span className="text-sm font-bold text-stone-400 line-through">₹{Number(product.base_price).toFixed(2)}</span>}
                <span className={`text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full border ${product.stock > 0 ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-stone-100 text-stone-500 border-stone-200"}`}>
                  {product.stock > 0 ? `${product.stock} In Vault` : "Sold"}
                </span>
              </div>
            )}

            {isOwner && isEditing ? (
              <div className="mt-6 bg-amber-50/50 p-5 rounded-3xl border border-amber-200/60 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-800 flex items-center gap-2"><Layers className="w-4 h-4 text-amber-600" /> Specifications (Karat, Size)</h4>
                <form onSubmit={handleAddVariant} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input type="text" required placeholder="e.g. 24K Gold, Size 7" value={variantForm.name} onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })} className="sm:col-span-2 px-4 py-2.5 text-xs bg-white border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500" />
                  <input type="number" step="0.01" placeholder="+Price (₹)" value={variantForm.additional_price} onChange={(e) => setVariantForm({ ...variantForm, additional_price: e.target.value })} className="px-3 py-2.5 text-xs bg-white border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500" />
                  <button type="submit" className="px-3 py-2.5 bg-amber-600 text-white text-xs font-bold uppercase rounded-xl"><Plus className="w-4 h-4 mx-auto" /></button>
                </form>
                {product.variants?.length > 0 && (
                  <div className="divide-y divide-amber-100 pt-2">
                    {product.variants.map((v) => (
                      <div key={v.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div><span className="font-bold text-stone-800">{v.name}</span> {Number(v.additional_price) > 0 && <span className="ml-1 text-[10px] text-amber-600 font-bold">(+₹{Number(v.additional_price).toFixed(2)})</span>}</div>
                        <button onClick={() => handleDeleteVariant(v.id)} className="p-1 text-stone-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              product.variants?.length > 0 && (
                <div className="mt-8">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">Select Variation</label>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((v) => (
                      <button key={v.id} type="button" onClick={() => !isOtherVendor && setSelectedVariant(v)} disabled={isOtherVendor} className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all ${selectedVariant?.id === v.id ? "border-amber-500 bg-amber-50 text-amber-900 shadow-md shadow-amber-500/10" : "border-stone-200 bg-white text-stone-600 hover:border-amber-300"} ${isOtherVendor ? "opacity-50 cursor-not-allowed" : ""}`}>
                        {v.name} {Number(v.additional_price) > 0 && `(+₹${Number(v.additional_price)})`}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}

            <div className="mt-8 pt-6 border-t border-amber-100/60">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">The Details</h3>
              {isOwner && isEditing ? (
                <textarea rows={4} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="w-full p-4 bg-stone-50 border border-amber-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500" />
              ) : (
                <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line font-medium">{product.description}</p>
              )}
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-amber-100/60 space-y-5">
            {isOwner ? (
              <div className="bg-gradient-to-tr from-amber-50 to-white border border-amber-200 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-serif font-black text-amber-900">Atelier Control</h4>
                  <p className="text-xs text-amber-700/70 font-medium">Modify this piece's details.</p>
                </div>
                {isEditing ? (
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 bg-white border border-stone-200 text-stone-600 rounded-full text-xs font-bold uppercase tracking-wider">Cancel</button>
                    <button onClick={handleSaveProductEdit} className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-md">Save</button>
                  </div>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-md shadow-amber-900/20 flex items-center gap-2"><Edit3 className="w-4 h-4" /> Edit Piece</button>
                )}
              </div>
            ) : isOtherVendor ? (
              <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl text-center"><p className="text-xs font-bold text-stone-600 uppercase tracking-widest">Master: {product.vendor_name}</p></div>
            ) : (
              <>
                <button onClick={handleAddToCart} disabled={product.stock <= 0} className={`w-full py-4 px-6 rounded-full text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl ${added ? "bg-emerald-700 text-white shadow-emerald-900/20" : product.stock > 0 ? "bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-600 text-white hover:scale-[1.02] shadow-amber-900/20" : "bg-stone-100 text-stone-400 cursor-not-allowed shadow-none"}`}>
                  {added ? <><Check className="w-5 h-5" /> Secured in Bag</> : <><ShoppingCart className="w-5 h-5" /> Add to Collection</>}
                </button>
                <div className="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase tracking-widest text-stone-400 pt-2">
                  <div className="flex items-center gap-2 justify-center"><Truck className="w-4 h-4 text-amber-600" /> Insured Transit</div>
                  <div className="flex items-center gap-2 justify-center"><ShieldCheck className="w-4 h-4 text-amber-600" /> Authenticity Verified</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* ... Review section remains similar structure but uses amber accents ... */}
    </div>
  );
}