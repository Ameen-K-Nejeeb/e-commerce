// src/pages/Catalog.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  ShoppingCart, 
  Check, 
  Star, 
  Store, 
  PackageOpen, 
  SlidersHorizontal,
  ExternalLink,
  Sparkles
} from 'lucide-react';

import HeroBanner from './HelloBanner';



export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState([]);

  // Vendor toggle: show all products vs only this vendor's items
  const [onlyMyProducts, setOnlyMyProducts] = useState(false);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isVendor = user?.role === 'VENDOR';

  useEffect(() => {
    api.get('store/categories/')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, ordering, onlyMyProducts]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;
      if (ordering) params.ordering = ordering;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;

      // When vendor toggles "My Products", tell Django to scope to this vendor
      if (isVendor && onlyMyProducts) {
        params.my_products = 'true';
      }

      const res = await api.get('store/products/', { params });
      setProducts(res.data);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setOrdering('-created_at');
    setOnlyMyProducts(false);
  };

  const handleAddToCart = (product) => {
    // 1. Guard check: redirect guests to login
    if (!user) {
      navigate('/login');
      return;
    }

    // 2. Add to cart if logged in
    addToCart(product);
    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== product.id));
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#faf8f5]/40 min-h-screen">
      
      <HeroBanner />

      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-amber-100/80">
        <div>
          <div className="flex items-center gap-2 text-amber-700/80 text-xs uppercase tracking-[0.25em] font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Curated High Ornaments & Fine Jewelry
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            The Ornastyle Collection
          </h1>
          <p className="mt-1.5 text-sm text-stone-500 max-w-xl leading-relaxed">
            Discover handcrafted gold, diamonds, and precious gemstones directly from certified independent master jewelers.
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Vendor Inventory Toggle */}
          {isVendor && (
            <div className="flex items-center bg-stone-100 p-1 rounded-2xl border border-stone-200">
              <button
                onClick={() => setOnlyMyProducts(false)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  !onlyMyProducts ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                All Pieces
              </button>
              <button
                onClick={() => setOnlyMyProducts(true)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                  onlyMyProducts ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <Store className="w-3.5 h-3.5" /> My Products
              </button>
            </div>
          )}

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-amber-700/50" />
            <input
              type="text"
              placeholder="Search necklaces, rings, gold..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 bg-white text-stone-900 placeholder:text-stone-400 border border-amber-200/80 rounded-2xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white text-xs font-medium rounded-xl transition-all shadow-sm"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Category Pills & Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-5 border-b border-amber-100/60">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase whitespace-nowrap transition-all ${
              selectedCategory === ''
                ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 text-white shadow-md shadow-amber-600/20'
                : 'bg-white text-stone-600 border border-stone-200 hover:border-amber-300 hover:text-amber-800'
            }`}
          >
            All Creations
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase whitespace-nowrap transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 text-white shadow-md shadow-amber-600/20'
                  : 'bg-white text-stone-600 border border-stone-200 hover:border-amber-300 hover:text-amber-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-amber-700/60" />
          <select
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
            className="bg-white border border-amber-200 text-xs font-medium text-stone-700 py-2 px-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-colors cursor-pointer shadow-sm"
          >
            <option value="-created_at">Latest Additions</option>
            <option value="base_price">Price: Low to High</option>
            <option value="-base_price">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="py-28 flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-amber-800/60 font-semibold">Gathering Ornaments...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-amber-100/80 mt-8 shadow-sm">
          <PackageOpen className="w-12 h-12 text-amber-300 mx-auto mb-3" />
          <h3 className="text-xl font-serif font-bold text-stone-900">
            {onlyMyProducts ? 'No creations listed in your atelier' : 'No ornaments match your selection'}
          </h3>
          <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto">
            {onlyMyProducts 
              ? 'Visit your Artisan Studio to publish your handcrafted designs.' 
              : 'Try clearing search keywords or choosing another category.'}
          </p>
          {onlyMyProducts ? (
            <Link
              to="/vendor/studio"
              className="mt-5 inline-block px-5 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white text-xs uppercase tracking-wider font-bold rounded-full transition-all shadow-md shadow-amber-600/20"
            >
              Enter Artisan Studio
            </Link>
          ) : (
            <button
              onClick={handleClearFilters}
              className="mt-5 px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs uppercase tracking-wider font-semibold rounded-full transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7 mt-8">
          {products.map((product) => {
            const isAdded = addedIds.includes(product.id);
            const isMyProduct = isVendor && Number(user?.id) === Number(product.vendor_user_id);
            const primaryImage = product.images?.find((img) => img.is_primary)?.image_url 
              || product.images?.[0]?.image_url 
              || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600';

            const discountPercentage = product.discount_price 
              ? Math.round(((product.base_price - product.discount_price) / product.base_price) * 100) 
              : null;

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-amber-100/70 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-xl hover:shadow-amber-900/5 hover:border-amber-200 transition-all duration-300 group"
              >
                {/* Product Image Frame */}
                <Link to={`/product/${product.id}`} className="relative aspect-square w-full bg-[#fcfaf7] overflow-hidden block">
                  <img
                    src={primaryImage}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  
                  {discountPercentage && (
                    <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                      {discountPercentage}% OFF
                    </span>
                  )}

                  {/* Vendor Store Tag */}
                  <span className={`absolute bottom-3 left-3 backdrop-blur-md text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border ${
                    isMyProduct 
                      ? 'bg-amber-600 text-white border-amber-500' 
                      : 'bg-white/95 text-stone-800 border-amber-100'
                  }`}>
                    <Store className={`w-3 h-3 ${isMyProduct ? 'text-white' : 'text-amber-600'}`} />
                    {isMyProduct ? 'My Atelier' : product.vendor_name}
                  </span>
                </Link>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-stone-400 font-medium uppercase tracking-wider mb-1.5">
                      <span>{product.category_name}</span>
                      {product.average_rating > 0 && (
                        <span className="flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                          <Star className="w-3 h-3 fill-amber-400 stroke-amber-500" />
                          {Number(product.average_rating).toFixed(1)}
                        </span>
                      )}
                    </div>

                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-serif font-bold text-stone-900 text-base leading-snug line-clamp-1 group-hover:text-amber-700 transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    {product.brand && (
                      <p className="text-[11px] text-amber-800/70 mt-0.5 font-medium">
                        Hallmark: {product.brand}
                      </p>
                    )}

                    <p className="text-xs text-stone-500 mt-2 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Price & Cart Actions */}
                  <div className="pt-4 mt-4 border-t border-amber-100/60 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-serif font-black text-stone-900">
                          ₹{Number(product.effective_price).toFixed(2)}
                        </span>
                        {product.discount_price && (
                          <span className="text-xs text-stone-400 line-through">
                            ₹{Number(product.base_price).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                        product.stock > 0 ? 'text-emerald-700' : 'text-stone-400'
                      }`}>
                        {product.stock > 0 ? `${product.stock} Available` : 'Made to Order / Sold'}
                      </p>
                    </div>

                    {/* Action Button */}
                    {isMyProduct ? (
                      <Link
                        to={`/product/${product.id}`}
                        className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-full transition-all shadow-sm"
                        title="Edit jewelry piece"
                      >
                        Edit
                      </Link>
                    ) : isVendor ? (
                      <Link
                        to={`/product/${product.id}`}
                        className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-full transition-colors flex items-center gap-1"
                        title="View ornament"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock <= 0}
                        className={`p-2.5 rounded-full text-xs font-semibold transition-all shadow-md flex items-center justify-center ${
                          isAdded
                            ? 'bg-emerald-600 text-white'
                            : product.stock > 0
                            ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 text-white hover:from-amber-700 hover:to-yellow-700 shadow-amber-600/20 active:scale-95'
                            : 'bg-stone-100 text-stone-400 cursor-not-allowed shadow-none'
                        }`}
                        title={product.stock > 0 ? 'Add to Bag' : 'Out of Stock'}
                      >
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
  );
}