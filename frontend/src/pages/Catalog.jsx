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
  Layers
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Marketplace Catalog</h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse genuine products from verified independent vendors.
          </p>
        </div>

        {/* Vendor Inventory Toggle */}
        {isVendor && (
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setOnlyMyProducts(false)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                !onlyMyProducts ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              All Marketplace
            </button>
            <button
              onClick={() => setOnlyMyProducts(true)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                onlyMyProducts ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Store className="w-3.5 h-3.5" /> My Products
            </button>
          </div>
        )}

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-20 py-2.5 bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm"
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
            className="bg-gray-50 focus:bg-white border border-gray-300 text-xs font-medium text-gray-700 py-1.5 px-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            <option value="-created_at">Newest First</option>
            <option value="base_price">Price: Low to High</option>
            <option value="-base_price">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 mt-8 shadow-sm">
          <PackageOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900">
            {onlyMyProducts ? 'You haven’t listed any products yet' : 'No products match your criteria'}
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            {onlyMyProducts 
              ? 'Visit your Vendor Studio to create your first listing.' 
              : 'Try adjusting your search keywords or resetting filters.'}
          </p>
          {onlyMyProducts ? (
            <Link
              to="/vendor/studio"
              className="mt-4 inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Go to Vendor Studio
            </Link>
          ) : (
            <button
              onClick={handleClearFilters}
              className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {products.map((product) => {
            const isAdded = addedIds.includes(product.id);
            const isMyProduct = isVendor && Number(user?.id) === Number(product.vendor_user_id);
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

                  {/* Vendor Store Tag */}
                  <span className={`absolute bottom-3 left-3 backdrop-blur-sm text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm ${
                    isMyProduct ? 'bg-emerald-600 text-white' : 'bg-white/90 text-gray-700'
                  }`}>
                    <Store className={`w-3 h-3 ${isMyProduct ? 'text-white' : 'text-indigo-600'}`} />
                    {isMyProduct ? 'Your Store' : product.vendor_name}
                  </span>
                </Link>

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

                    {/* Action Button */}
                    {isMyProduct ? (
                      <Link
                        to={`/product/${product.id}`}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shadow-sm"
                        title="Edit your product"
                      >
                        Edit
                      </Link>
                    ) : isVendor ? (
                      <Link
                        to={`/product/${product.id}`}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                        title="Inspect listing"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View
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
                        title={product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
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