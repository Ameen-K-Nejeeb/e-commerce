// src/pages/Catalog.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  ExternalLink
} from 'lucide-react';

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

  const { addToCart } = useCart();
  const { user } = useAuth();
  const isVendor = user?.role === 'VENDOR';

  // Fetch initial category list
  useEffect(() => {
    api.get('store/categories/')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  // Fetch products with backend search and filtering query parameters
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, ordering]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;
      if (ordering) params.ordering = ordering;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;

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
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== product.id));
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Search Bar & Primary Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Marketplace Catalog</h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse genuine products from verified independent vendors.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search shoes, shirts, watches, phones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-20 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category Pills & Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-4 border-y border-gray-200">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === ''
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Categories
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <select
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
            className="bg-white border border-gray-200 text-xs font-medium text-gray-700 py-1.5 px-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="-created_at">Newest First</option>
            <option value="base_price">Price: Low to High</option>
            <option value="-base_price">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 mt-8 shadow-sm">
          <PackageOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900">No products match your criteria</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords, clear category filters, or explore our new arrivals.
          </p>
          <button
            onClick={handleClearFilters}
            className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {products.map((product) => {
            const isAdded = addedIds.includes(product.id);
            const primaryImage = product.images?.find((img) => img.is_primary)?.image_url 
              || product.images?.[0]?.image_url 
              || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500';

            const discountPercentage = product.discount_price 
              ? Math.round(((product.base_price - product.discount_price) / product.base_price) * 100) 
              : null;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-200 group"
              >
                {/* Clickable Image Section linked to /product/:id */}
                <Link to={`/product/${product.id}`} className="relative aspect-square w-full bg-gray-50 overflow-hidden block">
                  <img
                    src={primaryImage}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {discountPercentage && (
                    <span className="absolute top-3 left-3 bg-rose-500 text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-sm">
                      {discountPercentage}% OFF
                    </span>
                  )}

                  <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                    <Store className="w-3 h-3 text-indigo-600" />
                    {product.vendor_name}
                  </span>
                </Link>

                {/* Content Section */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-400 font-medium mb-1">
                      <span>{product.category_name}</span>
                      {product.average_rating > 0 && (
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                          {product.average_rating}
                        </span>
                      )}
                    </div>

                    {/* Clickable Title linked to /product/:id */}
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    {product.brand && (
                      <p className="text-xs text-gray-500 mt-0.5 font-medium">
                        By {product.brand}
                      </p>
                    )}

                    <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Pricing & Contextual Action */}
                  <div className="pt-4 mt-3 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-gray-900">
                          ₹{Number(product.effective_price).toFixed(2)}
                        </span>
                        {product.discount_price && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{Number(product.base_price).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] font-bold mt-0.5 ${
                        product.stock > 0 ? 'text-emerald-600' : 'text-rose-500'
                      }`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                      </p>
                    </div>

                    {/* If Vendor: Show 'View Details / Edit' link. If Customer/Guest: Show Add to Cart */}
                    {isVendor ? (
                      <Link
                        to={`/product/${product.id}`}
                        className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shadow-sm"
                        title="Inspect or edit this listing"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Details
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock <= 0}
                        className={`p-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center justify-center ${
                          isAdded
                            ? 'bg-emerald-600 text-white'
                            : product.stock > 0
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        title={product.stock > 0 ? 'Add to Cart' : 'Item Sold Out'}
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