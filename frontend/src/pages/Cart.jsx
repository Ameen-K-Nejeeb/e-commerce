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
      alert('Please provide complete recipient details and delivery address.');
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
        alert('Payment confirmed! Your order is now PAID.');
        navigate('/orders');
      };

      // 2. Check if real Razorpay script is available
      if (window.Razorpay && !data.razorpay_key.includes('placeholder')) {
        const options = {
          key: data.razorpay_key,
          amount: data.amount,
          currency: data.currency,
          name: 'MarketPulse Multi-Vendor',
          description: `Order #${data.order_id}`,
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
          theme: { color: '#4F46E5' },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function () {
          alert('Payment cancelled or failed. Order remains PENDING.');
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
          alert('Payment skipped. Order saved as PENDING in My Orders.');
          navigate('/orders');
        }
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to initialize checkout.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-gray-500 mt-2 text-sm">Add clothes, shoes, gadgets, or watches to get started.</p>
        <Link
          to="/"
          className="mt-6 inline-block bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout & Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Items in Cart & Delivery Destination */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Cart Items */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-600" /> Items in Cart ({cart.length})
              </h2>

              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.variant?.id || 'base'}`}
                  className="flex items-center justify-between py-3 border-b border-gray-50 last:border-none"
                >
                  <div className="flex items-center gap-3">
                    {/* Item Thumbnail */}
                    <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100 flex-shrink-0">
                      {item.image || item.primary_image || item.product_image ? (
                        <img
                          src={item.image || item.primary_image || item.product_image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 text-sm leading-tight">{item.name}</h3>
                      {item.variant && (
                        <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                          Variant: {item.variant.name}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">Quantity: {item.quantity}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-900 text-sm">
                      ₹{(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-rose-500 transition-colors p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Destination Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-600" /> Delivery Address
                </h2>
                
                {hasSavedAddress && !manualOverride && (
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(true)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Profile Address
                  </button>
                )}
              </div>

              {profileLoading ? (
                <div className="py-6 text-center text-xs text-gray-400">Loading saved address...</div>
              ) : hasSavedAddress && !manualOverride ? (
                /* Primary View: 1-Click Saved Delivery Card */
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-gray-900 text-sm">{shipping.full_name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Default Saved Address
                      </span>
                    </div>

                    <p className="text-gray-700 font-medium">
                      {shipping.address}, {shipping.city}{shipping.state ? `, ${shipping.state}` : ''} —{' '}
                      <span className="font-mono font-bold text-gray-900">{shipping.pincode}</span>
                    </p>

                    <div className="flex items-center gap-1 text-gray-500 pt-0.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>Contact: <strong>{shipping.phone}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setManualOverride(true)}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-white transition-colors"
                    >
                      Ship to Different Address
                    </button>
                  </div>
                </div>
              ) : (
                /* Form Mode: Enter or Override Address */
                <div className="space-y-4">
                  {manualOverride && (
                    <div className="flex items-center justify-between text-xs text-indigo-600 pb-1">
                      <span>Entering an alternate address for this order.</span>
                      <button
                        type="button"
                        onClick={() => {
                          setManualOverride(false);
                          loadSavedProfileAddress();
                        }}
                        className="font-bold underline"
                      >
                        Use Saved Profile Address
                      </button>
                    </div>
                  )}

                  {!hasSavedAddress && (
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-xs flex items-center justify-between">
                      <span>No saved default address found in your account.</span>
                      <button
                        type="button"
                        onClick={() => setIsDrawerOpen(true)}
                        className="font-bold text-indigo-700 underline flex items-center gap-1"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Save in Profile
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Recipient Name</label>
                      <input
                        type="text"
                        required
                        value={shipping.full_name}
                        onChange={(e) => setShipping({ ...shipping, full_name: e.target.value })}
                        placeholder="Full Name"
                        className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Phone Number</label>
                      <input
                        type="text"
                        required
                        value={shipping.phone}
                        onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                        placeholder="10-digit mobile number"
                        className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Street Address</label>
                      <input
                        type="text"
                        required
                        value={shipping.address}
                        onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                        placeholder="House/Flat No, Street, Locality"
                        className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">City / District</label>
                      <input
                        type="text"
                        required
                        value={shipping.city}
                        onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                        placeholder="e.g. Idukki, Kochi"
                        className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">PIN Code</label>
                      <input
                        type="text"
                        required
                        value={shipping.pincode}
                        onChange={(e) => setShipping({ ...shipping, pincode: e.target.value })}
                        placeholder="6-digit PIN code"
                        className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Payment & Summary */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Order Summary</h2>
            
            <div className="space-y-2 text-xs text-gray-600 border-b border-gray-100 pb-4">
              <div className="flex justify-between">
                <span>Subtotal ({cart.length} item{cart.length > 1 ? 's' : ''})</span>
                <span className="font-bold text-gray-900">₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" /> Standard Insured Shipping
                </span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline py-2">
              <span className="text-sm font-bold text-gray-800">Final Total</span>
              <span className="text-2xl font-black text-indigo-600">₹{totalAmount.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-white font-bold bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <ShieldCheck className="w-5 h-5" />
              {loading ? 'Processing...' : 'Pay with Razorpay'}
            </button>
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