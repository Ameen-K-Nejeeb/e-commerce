// src/pages/Cart.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Trash2,
  ShoppingBag,
  ShieldCheck,
  MapPin,
  Edit3,
  CheckCircle2,
  Phone,
  User as UserIcon,
  PlusCircle,
  Truck,
  Sparkles,
  Lock
} from 'lucide-react';
import ProfileDrawer from './ProfileDrawer';

export default function Cart() {
  const { cart, removeFromCart, clearCart, totalAmount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [manualOverride, setManualOverride] = useState(false);

  const [shipping, setShipping] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Fetch saved profile & delivery address on load
  const loadSavedProfileAddress = async () => {
    if (!user) {
      setProfileLoading(false);
      return;
    }

    try {
      setProfileLoading(true);
      const res = await api.get('auth/profile/');
      const data = res.data;

      const fullName =
        `${data.first_name || ''} ${data.last_name || ''}`.trim() ||
        user.first_name ||
        user.email.split('@')[0];

      setShipping({
        full_name: fullName,
        phone: data.phone_number || '',
        address: data.address || '',
        city: data.city_district || '',
        state: data.state || '',
        pincode: data.pincode || '',
      });
    } catch (err) {
      console.warn('Could not auto-load saved profile address:', err);
      // Fallback to user context basics
      setShipping((prev) => ({
        ...prev,
        full_name: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '',
      }));
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    loadSavedProfileAddress();
  }, [user]);

  // Handle drawer close: reload to reflect newly saved address immediately
  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    loadSavedProfileAddress();
  };

  const hasSavedAddress = Boolean(
    shipping.full_name &&
    shipping.phone &&
    shipping.address &&
    shipping.city &&
    shipping.pincode
  );

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!shipping.full_name || !shipping.phone || !shipping.address || !shipping.city || !shipping.pincode) {
      alert('Please provide complete recipient details and delivery destination.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on backend
      const { data } = await api.post('store/checkout/create-order/', {
        items: cart.map((item) => ({
          product_id: item.id,
          variant_id: item.variant?.id || null,
          quantity: item.quantity,
        })),
        shipping: {
          full_name: shipping.full_name,
          phone: shipping.phone,
          address: shipping.address,
          city: shipping.city,
          pincode: shipping.pincode,
        },
      });

      const triggerVerification = async (paymentId, signature) => {
        await api.post('store/checkout/verify-payment/', {
          razorpay_order_id: data.razorpay_order_id,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        });
        clearCart();
        alert('Payment confirmed! Your order is secured.');
        navigate('/orders');
      };

      // 2. Check if real Razorpay script is available
      if (window.Razorpay && !data.razorpay_key.includes('placeholder')) {
        const options = {
          key: data.razorpay_key,
          amount: data.amount,
          currency: data.currency,
          name: 'Ornastyle Luxury',
          description: `Acquisition Ref #${data.order_id}`,
          order_id: data.razorpay_order_id,
          handler: async function (response) {
            try {
              await triggerVerification(response.razorpay_payment_id, response.razorpay_signature);
            } catch (err) {
              alert('Payment verification failed on the server.');
            }
          },
          prefill: {
            name: shipping.full_name,
            email: user.email,
            contact: shipping.phone,
          },
          theme: { color: '#d97706' }, // Amber 600
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function () {
          alert('Payment cancelled or failed. Order remains pending in your vault.');
          navigate('/orders');
        });
        rzp.open();
      } else {
        // 3. Local Mock Testing Fallback
        const simulateSuccess = window.confirm(
          `[LOCAL DEV MODE] Razorpay Live SDK is in test placeholder mode.\n\nSimulate successful payment for ₹${(data.amount / 100).toFixed(2)}?`
        );

        if (simulateSuccess) {
          const mockPaymentId = `pay_mock_${Date.now()}`;
          await triggerVerification(mockPaymentId, 'mock_signature_valid');
        } else {
          alert('Payment skipped. Acquisition saved as pending.');
          navigate('/orders');
        }
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to initialize secure checkout.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center">
        <ShoppingBag className="w-16 h-16 text-amber-200 mx-auto mb-6" />
        <h2 className="text-3xl font-serif font-black text-stone-900">Your bag is empty</h2>
        <p className="text-stone-500 mt-2 text-sm font-medium">Discover fine jewelry and add pieces to your collection.</p>
        <Link
          to="/"
          className="mt-8 inline-block bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-bold uppercase tracking-widest px-8 py-3.5 rounded-full transition-all shadow-md shadow-amber-600/20 hover:scale-[1.02]"
        >
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-[calc(100vh-4rem)] bg-[#faf8f5]/40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 border-b border-amber-100/60 pb-6">
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-stone-900">Secure Checkout</h1>
            <p className="text-xs uppercase tracking-widest font-bold text-amber-700/60 mt-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Confirm your acquisitions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Left: Items in Cart & Delivery Destination */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Cart Items */}
              <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-amber-100/60 shadow-xl shadow-amber-900/5">
                <h2 className="text-lg font-serif font-black text-stone-900 border-b border-amber-100/60 pb-4 flex items-center gap-2.5">
                  <ShoppingBag className="w-5 h-5 text-amber-600" /> Jewelry Bag ({cart.length})
                </h2>

                <div className="pt-2">
                  {cart.map((item) => (
                    <div
                      key={`${item.id}-${item.variant?.id || 'base'}`}
                      className="flex items-center justify-between py-5 border-b border-stone-50 last:border-none"
                    >
                      <div className="flex items-center gap-5">
                        {/* Item Thumbnail */}
                        <div className="w-16 h-16 bg-[#fcfaf7] rounded-2xl overflow-hidden flex items-center justify-center border border-amber-100/50 flex-shrink-0 shadow-inner">
                          {item.image || item.primary_image || item.product_image ? (
                            <img
                              src={item.image || item.primary_image || item.product_image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ShoppingBag className="w-6 h-6 text-amber-200" />
                          )}
                        </div>

                        <div>
                          <h3 className="font-serif font-bold text-stone-900 text-base leading-tight">
                            <Link to={`/product/${item.id}`} className="hover:text-amber-700 transition-colors">{item.name}</Link>
                          </h3>
                          {item.variant && (
                            <p className="text-[10px] uppercase tracking-widest text-amber-700 font-bold mt-1.5">
                              Spec: {item.variant.name}
                            </p>
                          )}
                          <p className="text-xs font-medium text-stone-400 mt-1">Qty: {item.quantity}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-5">
                        <span className="font-serif font-black text-stone-900 text-lg">
                          ₹{(Number(item.price) * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-stone-300 hover:text-rose-600 transition-colors p-1.5 bg-stone-50 hover:bg-rose-50 rounded-full"
                          title="Remove piece"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Destination Section */}
              <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-amber-100/60 shadow-xl shadow-amber-900/5">
                <div className="flex items-center justify-between border-b border-amber-100/60 pb-4">
                  <h2 className="text-lg font-serif font-black text-stone-900 flex items-center gap-2.5">
                    <MapPin className="w-5 h-5 text-amber-600" /> Destination Vault
                  </h2>
                  
                  {hasSavedAddress && !manualOverride && (
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(true)}
                      className="text-[10px] uppercase tracking-widest font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Profile Address
                    </button>
                  )}
                </div>

                <div className="pt-6">
                  {profileLoading ? (
                    <div className="py-6 text-center text-[10px] uppercase tracking-widest font-bold text-stone-400">Loading secure address...</div>
                  ) : hasSavedAddress && !manualOverride ? (
                    /* Primary View: 1-Click Saved Delivery Card */
                    <div className="p-5 rounded-3xl bg-amber-50/40 border border-amber-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-sm">
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-black uppercase tracking-wider text-stone-900 text-sm">{shipping.full_name}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-widest font-black bg-emerald-100/80 text-emerald-800 border border-emerald-200 flex items-center gap-1 shadow-sm">
                            <CheckCircle2 className="w-3 h-3" /> Default Vault
                          </span>
                        </div>

                        <p className="text-stone-600 font-medium leading-relaxed">
                          {shipping.address}, {shipping.city}{shipping.state ? `, ${shipping.state}` : ''} —{' '}
                          <span className="font-mono font-bold text-stone-900">{shipping.pincode}</span>
                        </p>

                        <div className="flex items-center gap-1.5 text-stone-500 pt-1">
                          <Phone className="w-3.5 h-3.5 text-stone-400" />
                          <span className="font-medium">Direct Line: <strong className="text-stone-800">{shipping.phone}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setManualOverride(true)}
                          className="text-[10px] uppercase tracking-widest font-bold px-4 py-2.5 rounded-full border border-stone-200 text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition-colors shadow-sm"
                        >
                          Ship Elsewhere
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Form Mode: Enter or Override Address */
                    <div className="space-y-5">
                      {manualOverride && (
                        <div className="flex items-center justify-between text-xs text-amber-700 font-bold bg-amber-50 px-4 py-3 rounded-xl border border-amber-100">
                          <span>Entering a one-time destination.</span>
                          <button
                            type="button"
                            onClick={() => {
                              setManualOverride(false);
                              loadSavedProfileAddress();
                            }}
                            className="font-black uppercase tracking-widest hover:text-amber-900 transition-colors"
                          >
                            Use Profile Address
                          </button>
                        </div>
                      )}

                      {!hasSavedAddress && (
                        <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-600 text-xs font-medium flex items-center justify-between">
                          <span>No default vault saved in your profile.</span>
                          <button
                            type="button"
                            onClick={() => setIsDrawerOpen(true)}
                            className="font-bold text-amber-700 hover:text-amber-800 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                          >
                            <PlusCircle className="w-3.5 h-3.5" /> Save in Profile
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">Recipient Name</label>
                          <input
                            type="text"
                            required
                            value={shipping.full_name}
                            onChange={(e) => setShipping({ ...shipping, full_name: e.target.value })}
                            placeholder="Full Name"
                            className="w-full text-sm p-3 bg-stone-50 text-stone-900 font-medium placeholder:text-stone-400 border border-amber-200/60 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 focus:bg-white transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">Contact Line</label>
                          <input
                            type="text"
                            required
                            value={shipping.phone}
                            onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                            placeholder="10-digit number"
                            className="w-full text-sm p-3 bg-stone-50 text-stone-900 font-medium placeholder:text-stone-400 border border-amber-200/60 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 focus:bg-white transition-colors"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">Estate / Address</label>
                          <input
                            type="text"
                            required
                            value={shipping.address}
                            onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                            placeholder="Suite, Building, Street"
                            className="w-full text-sm p-3 bg-stone-50 text-stone-900 font-medium placeholder:text-stone-400 border border-amber-200/60 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 focus:bg-white transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">City / District</label>
                          <input
                            type="text"
                            required
                            value={shipping.city}
                            onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                            placeholder="e.g. Mumbai"
                            className="w-full text-sm p-3 bg-stone-50 text-stone-900 font-medium placeholder:text-stone-400 border border-amber-200/60 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 focus:bg-white transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">Postal Code</label>
                          <input
                            type="text"
                            required
                            value={shipping.pincode}
                            onChange={(e) => setShipping({ ...shipping, pincode: e.target.value })}
                            placeholder="PIN code"
                            className="w-full text-sm p-3 bg-stone-50 text-stone-900 font-medium font-mono tracking-widest placeholder:text-stone-400 border border-amber-200/60 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 focus:bg-white transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Payment & Summary */}
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-amber-100/60 shadow-xl shadow-amber-900/5 h-fit space-y-6 sticky top-28">
              <h2 className="text-lg font-serif font-black text-stone-900 border-b border-amber-100/60 pb-4">Appraisal & Finalization</h2>
              
              <div className="space-y-3 text-sm text-stone-500 font-medium border-b border-amber-100/60 pb-6">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.length} piece{cart.length > 1 ? 's' : ''})</span>
                  <span className="font-bold text-stone-900">₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-600" /> Insured Logistics
                  </span>
                  <span className="font-bold text-emerald-600 uppercase tracking-widest text-[10px]">Complimentary</span>
                </div>
              </div>

              <div className="flex justify-between items-end pt-2 pb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Total Value</span>
                <span className="text-3xl font-serif font-black text-amber-700">₹{totalAmount.toFixed(2)}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-4 px-6 rounded-full text-white font-black uppercase tracking-widest bg-gradient-to-r from-stone-900 to-stone-800 hover:from-black hover:to-stone-900 transition-all shadow-xl shadow-stone-900/20 flex items-center justify-center gap-2.5 text-xs disabled:opacity-50 hover:scale-[1.02]"
              >
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                {loading ? 'Securing Transaction...' : 'Complete Secure Checkout'}
              </button>
              
              <p className="text-center text-[10px] text-stone-400 font-medium flex items-center justify-center gap-1.5 mt-4">
                <Lock className="w-3 h-3" /> Payments protected by 256-bit encryption
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Slide-over Profile Drawer to update saved credentials & address */}
      <ProfileDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
      />
    </>
  );
}