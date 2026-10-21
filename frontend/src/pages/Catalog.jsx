// src/pages/Catalog.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Search, ShoppingCart, Check, Star, Store, PackageOpen, ExternalLink, Sparkles } from 'lucide-react';
import HeroBanner from './HelloBanner';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState([]);
  const [onlyMyProducts, setOnlyMyProducts] = useState(false);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isVendor = user?.role === 'VENDOR';

  useEffect(() => {
    api.get('store/categories/').then((res) => setCategories(res.data)).catch(console.error);
  }, []);
  
  useEffect(() => { fetchProducts(); }, [selectedCategory, ordering, onlyMyProducts]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;
      if (ordering) params.ordering = ordering;
      if (isVendor && onlyMyProducts) params.my_products = 'true';
      const res = await api.get('store/products/', { params });
      setProducts(res.data);
    } catch (err) {} finally { setLoading(false); }
  };
  
  const handleAddToCart = (product) => { 
    if (!user) { navigate('/login'); return; }
    addToCart(product); setAddedIds([...addedIds, product.id]);
    setTimeout(() => setAddedIds((prev) => prev.filter((id) => id !== product.id)), 1200);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5E6D3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <HeroBanner />

        {/* Top Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#C9A96A]/20">
          <div>
            <div className="flex items-center gap-2 text-[#C9A96A] text-xs uppercase tracking-[0.25em] font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" /> High Fashion & Exclusive Designs
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#F5E6D3] tracking-tight">
              The VELMORA Collection
            </h1>
            <p className="mt-1.5 text-sm text-[#F5E6D3]/60 max-w-xl leading-relaxed">
              Discover avant-garde apparel, designer bags, and statement accessories from world-class independent creators.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {isVendor && (
              <div className="flex items-center bg-[#111111] p-1 rounded-2xl border border-[#C9A96A]/30">
                <button onClick={() => setOnlyMyProducts(false)} className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl ${!onlyMyProducts ? 'bg-[#C9A96A] text-[#080808]' : 'text-[#F5E6D3]/50'}`}>All Pieces</button>
                <button onClick={() => setOnlyMyProducts(true)} className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 ${onlyMyProducts ? 'bg-[#C9A96A] text-[#080808]' : 'text-[#F5E6D3]/50'}`}>
                  <Store className="w-3.5 h-3.5" /> My Boutique
                </button>
              </div>
            )}
            <form onSubmit={(e)=>{e.preventDefault(); fetchProducts();}} className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#C9A96A]/50" />
              <input type="text" placeholder="Search dresses, bags, shoes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-24 py-2.5 bg-[#111111] text-[#F5E6D3] placeholder:text-[#F5E6D3]/40 border border-[#C9A96A]/30 rounded-2xl text-xs sm:text-sm outline-none focus:border-[#C9A96A]" />
              <button type="submit" className="absolute right-1.5 top-1.5 px-3 py-1 bg-[#C9A96A] text-[#080808] text-xs font-medium rounded-xl">Search</button>
            </form>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 py-5 border-b border-[#C9A96A]/20">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button onClick={() => setSelectedCategory('')} className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase ${selectedCategory === '' ? 'bg-[#C9A96A] text-[#080808]' : 'bg-[#111111] text-[#F5E6D3]/60 border border-[#C9A96A]/30'}`}>All Styles</button>
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.slug)} className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase ${selectedCategory === cat.slug ? 'bg-[#C9A96A] text-[#080808]' : 'bg-[#111111] text-[#F5E6D3]/60 border border-[#C9A96A]/30'}`}>{cat.name}</button>
            ))}
          </div>
          <select value={ordering} onChange={(e) => setOrdering(e.target.value)} className="bg-[#111111] border border-[#C9A96A]/30 text-xs font-medium text-[#F5E6D3] py-2 px-3 rounded-xl outline-none">
            <option value="-created_at">Latest Additions</option>
            <option value="base_price">Price: Low to High</option>
            <option value="-base_price">Price: High to Low</option>
          </select>
        </div>

        {loading ? (
          <div className="py-28 flex justify-center"><div className="w-9 h-9 border-3 border-[#C9A96A] border-t-transparent rounded-full animate-spin" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 bg-[#111111] rounded-3xl border border-[#C9A96A]/30 mt-8">
            <PackageOpen className="w-12 h-12 text-[#C9A96A] mx-auto mb-3" />
            <h3 className="text-xl font-serif font-bold text-[#F5E6D3]">{onlyMyProducts ? 'No items in your boutique' : 'No items match your selection'}</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7 mt-8">
            {products.map((product) => {
              const isAdded = addedIds.includes(product.id);
              const isMyProduct = isVendor && Number(user?.id) === Number(product.vendor_user_id);
              const primaryImage = product.images?.find((img) => img.is_primary)?.image_url || product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600';
              
              return (
                <div key={product.id} className="bg-[#111111] rounded-3xl border border-[#C9A96A]/20 overflow-hidden flex flex-col hover:border-[#C9A96A] transition-all group">
                  <Link to={`/product/${product.id}`} className="relative aspect-[3/4] w-full bg-[#080808] overflow-hidden block">
                    <img src={primaryImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    {product.discount_price && <span className="absolute top-3 left-3 bg-[#C9A96A] text-[#080808] text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full">SALE</span>}
                    <span className="absolute bottom-3 left-3 bg-[#080808]/80 backdrop-blur-md text-[#C9A96A] text-[10px] uppercase font-semibold px-2.5 py-1 rounded-full border border-[#C9A96A]/30 flex items-center gap-1">
                      <Store className="w-3 h-3" /> {isMyProduct ? 'My Boutique' : product.vendor_name}
                    </span>
                  </Link>
                  
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between text-[10px] text-[#C9A96A] uppercase tracking-wider mb-1.5">
                        <span>{product.category_name}</span>
                        {product.average_rating > 0 && <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-[#C9A96A]" /> {Number(product.average_rating).toFixed(1)}</span>}
                      </div>
                      <Link to={`/product/${product.id}`}><h3 className="font-serif font-bold text-[#F5E6D3] text-base line-clamp-1 group-hover:text-[#C9A96A]">{product.name}</h3></Link>
                      {product.brand && <p className="text-[11px] text-[#F5E6D3]/50 mt-0.5">Label: {product.brand}</p>}
                    </div>
                    
                    <div className="pt-4 mt-4 border-t border-[#C9A96A]/20 flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-serif font-black text-[#C9A96A]">₹{Number(product.effective_price).toFixed(2)}</span>
                          {product.discount_price && <span className="text-xs text-[#F5E6D3]/40 line-through">₹{Number(product.base_price).toFixed(2)}</span>}
                        </div>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${product.stock > 0 ? 'text-[#F5E6D3]/60' : 'text-red-500'}`}>{product.stock > 0 ? `${product.stock} Available` : 'Sold Out'}</p>
                      </div>
                      {isMyProduct ? (
                        <Link to={`/product/${product.id}`} className="px-3.5 py-2 bg-[#C9A96A] text-[#080808] text-xs font-bold rounded-full">Edit</Link>
                      ) : isVendor ? (
                        <Link to={`/product/${product.id}`} className="px-3 py-2 bg-[#111111] border border-[#C9A96A]/30 text-[#F5E6D3] text-xs font-semibold rounded-full flex gap-1"><ExternalLink className="w-3.5 h-3.5"/> View</Link>
                      ) : (
                        <button onClick={() => handleAddToCart(product)} disabled={product.stock <= 0} className={`p-2.5 rounded-full transition-all flex items-center justify-center ${isAdded ? 'bg-green-600 text-white' : product.stock > 0 ? 'bg-[#C9A96A] text-[#080808] hover:bg-[#B38D46]' : 'bg-[#111111] text-[#F5E6D3]/30 cursor-not-allowed border border-[#C9A96A]/20'}`}>
                          {isAdded ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}