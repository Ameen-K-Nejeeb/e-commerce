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
  Truck,
  Sparkles,
  Lock,
  PlusCircle
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
          name: 'VELMORA',
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
          theme: { color: '#C9A96A' }, 
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function () {
          alert('Payment cancelled or failed. Order remains pending in your wardrobe.');
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
      <div className="max-w-7xl mx-auto px-4 py-32 text-center min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center bg-[#080808]">
        <ShoppingBag className="w-16 h-16 text-[#C9A96A] mx-auto mb-6" />
        <h2 className="text-3xl font-serif font-black text-[#F5E6D3]">Your bag is empty</h2>
        <p className="text-[#F5E6D3]/60 mt-2 text-sm font-medium">Discover modern fashion and add pieces to your wardrobe.</p>
        <Link to="/" className="mt-8 inline-block bg-[#C9A96A] hover:bg-[#B38D46] text-[#080808] font-bold uppercase tracking-widest px-8 py-3.5 rounded-full transition-all hover:scale-[1.02]">
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#080808] py-12 text-[#F5E6D3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 border-b border-[#C9A96A]/20 pb-6">
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#C9A96A]">Secure Checkout</h1>
          <p className="text-xs uppercase tracking-widest font-bold text-[#F5E6D3]/60 mt-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A96A]" /> Confirm your pieces
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            {/* Cart Items */}
            <div className="bg-[#111111] p-6 sm:p-8 rounded-[2rem] border border-[#C9A96A]/20">
              <h2 className="text-lg font-serif font-black text-[#C9A96A] border-b border-[#C9A96A]/20 pb-4 flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5" /> Shopping Bag ({cart.length})
              </h2>
              <div className="pt-2">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.variant?.id || 'base'}`} className="flex items-center justify-between py-5 border-b border-[#C9A96A]/10 last:border-none">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-[#080808] rounded-2xl overflow-hidden flex items-center justify-center border border-[#C9A96A]/30">
                        {item.image || item.primary_image || item.product_image ? (
                          <img src={item.image || item.primary_image || item.product_image} alt={item.name} className="w-full h-full object-cover" />
                        ) : <ShoppingBag className="w-6 h-6 text-[#C9A96A]" />}
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-[#F5E6D3] text-base leading-tight">
                          <Link to={`/product/${item.id}`} className="hover:text-[#C9A96A] transition-colors">{item.name}</Link>
                        </h3>
                        {item.variant && <p className="text-[10px] uppercase tracking-widest text-[#C9A96A] font-bold mt-1.5">Size/Color: {item.variant.name}</p>}
                        <p className="text-xs font-medium text-[#F5E6D3]/50 mt-1">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <span className="font-serif font-black text-[#C9A96A] text-lg">₹{(Number(item.price) * item.quantity).toFixed(2)}</span>
                      {/* UPDATED: Pass both ID and Variant ID to correctly delete the item */}
                      <button 
                        onClick={() => removeFromCart(item.id, item.variant?.id)} 
                        className="text-[#F5E6D3]/40 hover:text-red-500 p-1.5 bg-[#080808] rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Destination Section */}
            <div className="bg-[#111111] p-6 sm:p-8 rounded-[2rem] border border-[#C9A96A]/20">
              <div className="flex items-center justify-between border-b border-[#C9A96A]/20 pb-4">
                <h2 className="text-lg font-serif font-black text-[#C9A96A] flex items-center gap-2.5">
                  <MapPin className="w-5 h-5" /> Delivery Destination
                </h2>
                {hasSavedAddress && !manualOverride && (
                  <button type="button" onClick={() => setIsDrawerOpen(true)} className="text-[10px] uppercase tracking-widest font-bold text-[#C9A96A] hover:text-white flex items-center gap-1">
                    <Edit3 className="w-3.5 h-3.5" /> Edit Address
                  </button>
                )}
              </div>
              <div className="pt-6">
                {profileLoading ? (
                  <div className="py-6 text-center text-[10px] uppercase tracking-widest font-bold text-[#F5E6D3]/50">Loading secure address...</div>
                ) : hasSavedAddress && !manualOverride ? (
                  <div className="p-5 rounded-3xl bg-[#080808] border border-[#C9A96A]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-black uppercase tracking-wider text-[#F5E6D3] text-sm">{shipping.full_name}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-widest font-black bg-[#C9A96A]/20 text-[#C9A96A] border border-[#C9A96A]/50 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Default
                        </span>
                      </div>
                      <p className="text-[#F5E6D3]/70 font-medium leading-relaxed">{shipping.address}, {shipping.city}{shipping.state ? `, ${shipping.state}` : ''} — <span className="font-mono font-bold text-[#C9A96A]">{shipping.pincode}</span></p>
                      <div className="flex items-center gap-1.5 text-[#F5E6D3]/50 pt-1"><Phone className="w-3.5 h-3.5" /><span className="font-medium">Direct Line: <strong className="text-[#F5E6D3]">{shipping.phone}</strong></span></div>
                    </div>
                    <button type="button" onClick={() => setManualOverride(true)} className="text-[10px] uppercase tracking-widest font-bold px-4 py-2.5 rounded-full border border-[#C9A96A]/30 text-[#C9A96A] hover:bg-[#C9A96A] hover:text-[#080808] transition-colors">Ship Elsewhere</button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {manualOverride && (
                      <div className="flex items-center justify-between text-xs text-[#C9A96A] font-bold bg-[#C9A96A]/10 px-4 py-3 rounded-xl border border-[#C9A96A]/30">
                        <span>Entering a one-time destination.</span>
                        <button type="button" onClick={() => { setManualOverride(false); loadSavedProfileAddress(); }} className="font-black uppercase tracking-widest hover:text-white transition-colors">Use Profile Address</button>
                      </div>
                    )}
                    {!hasSavedAddress && (
                      <div className="p-4 bg-[#080808] border border-[#C9A96A]/30 rounded-xl text-[#F5E6D3]/70 text-xs font-medium flex items-center justify-between">
                        <span>No default address saved in your profile.</span>
                        <button type="button" onClick={() => setIsDrawerOpen(true)} className="font-bold text-[#C9A96A] hover:text-white uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                          <PlusCircle className="w-3.5 h-3.5" /> Save in Profile
                        </button>
                      </div>
                    )}
                    <input type="text" placeholder="Full Name" value={shipping.full_name} onChange={(e)=>setShipping({...shipping, full_name: e.target.value})} className="w-full text-sm p-3 bg-[#080808] text-[#F5E6D3] border border-[#C9A96A]/30 rounded-xl outline-none focus:border-[#C9A96A]" />
                    <input type="text" placeholder="Phone (10-digit)" value={shipping.phone} onChange={(e)=>setShipping({...shipping, phone: e.target.value})} className="w-full text-sm p-3 bg-[#080808] text-[#F5E6D3] border border-[#C9A96A]/30 rounded-xl outline-none focus:border-[#C9A96A]" />
                    <input type="text" placeholder="Suite, Building, Street" value={shipping.address} onChange={(e)=>setShipping({...shipping, address: e.target.value})} className="w-full text-sm p-3 bg-[#080808] text-[#F5E6D3] border border-[#C9A96A]/30 rounded-xl outline-none focus:border-[#C9A96A]" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="City / District" value={shipping.city} onChange={(e)=>setShipping({...shipping, city: e.target.value})} className="w-full text-sm p-3 bg-[#080808] text-[#F5E6D3] border border-[#C9A96A]/30 rounded-xl outline-none focus:border-[#C9A96A]" />
                      <input type="text" placeholder="Postal Code" value={shipping.pincode} onChange={(e)=>setShipping({...shipping, pincode: e.target.value})} className="w-full text-sm p-3 bg-[#080808] text-[#F5E6D3] border border-[#C9A96A]/30 rounded-xl outline-none focus:border-[#C9A96A] font-mono tracking-widest" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment & Summary Block */}
          <div className="bg-[#111111] p-6 sm:p-8 rounded-[2rem] border border-[#C9A96A]/20 h-fit space-y-6 sticky top-28">
            <h2 className="text-lg font-serif font-black text-[#C9A96A] border-b border-[#C9A96A]/20 pb-4">Order Summary</h2>
            <div className="space-y-3 text-sm text-[#F5E6D3]/70 font-medium border-b border-[#C9A96A]/20 pb-6">
              <div className="flex justify-between">
                <span>Subtotal ({cart.length} piece{cart.length > 1 ? 's' : ''})</span>
                <span className="font-bold text-[#F5E6D3]">₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#C9A96A]" /> Delivery
                </span>
                <span className="font-bold text-[#C9A96A] uppercase tracking-widest text-[10px]">Complimentary</span>
              </div>
            </div>

            <div className="flex justify-between items-end pt-2 pb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#F5E6D3]/50">Total Value</span>
              <span className="text-3xl font-serif font-black text-[#C9A96A]">₹{totalAmount.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-4 px-6 rounded-full text-[#080808] font-black uppercase tracking-widest bg-[#C9A96A] hover:bg-[#B38D46] transition-all shadow-xl flex items-center justify-center gap-2.5 text-xs disabled:opacity-50 hover:scale-[1.02]"
            >
              <ShieldCheck className="w-5 h-5 text-[#080808]" />
              {loading ? 'Processing...' : 'Complete Checkout'}
            </button>
            
            <p className="text-center text-[10px] text-[#F5E6D3]/40 font-medium flex items-center justify-center gap-1.5 mt-4">
              <Lock className="w-3 h-3" /> Payments protected by 256-bit encryption
            </p>
          </div>
        </div>
      </div>
      <ProfileDrawer isOpen={isDrawerOpen} onClose={handleDrawerClose} />
    </div>
  );
}