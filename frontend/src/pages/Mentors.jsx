// src/pages/Mentors.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, DollarSign, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Mentors() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingSlotId, setBookingSlotId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const res = await api.get('store/mentors/');
      setMentors(res.data);
    } catch (err) {
      console.error('Failed to load mentors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = async (slot, mentor) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setBookingSlotId(slot.id);

    try {
      // 1. Create order for the mentorship slot
      const { data } = await api.post('store/checkout/create-order/', {
        items: [],
        mentorship_slot_id: slot.id,
      });

      // 2. Open Razorpay Checkout modal
      const options = {
        key: data.razorpay_key,
        amount: data.amount,
        currency: data.currency,
        name: `Mentorship Session with ${mentor.title}`,
        description: `Slot: ${new Date(slot.start_time).toLocaleString()}`,
        order_id: data.razorpay_order_id,
        handler: async function (response) {
          try {
            await api.post('store/checkout/verify-payment/', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            alert('Slot booked and verified successfully!');
            fetchMentors(); // Refresh listings to reflect booked status
          } catch (err) {
            alert('Payment verification failed on server.');
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#4F46E5',
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      alert(err.response?.data?.error || 'Unable to book slot at this time.');
    } finally {
      setBookingSlotId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="pb-8 border-b border-gray-200">
        <h1 className="text-3xl font-extrabold text-gray-900">Expert Mentors</h1>
        <p className="mt-1 text-sm text-gray-500">
          Book 1-on-1 code reviews, career guidance, and architecture consultation.
        </p>
      </div>

      {mentors.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 mt-6 shadow-sm">
          <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No mentors listed yet</h3>
          <p className="text-sm text-gray-500 mt-1">
            Registered mentors must have their profiles approved by an Admin to appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {mentors.map((mentor) => (
            <div
              key={mentor.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{mentor.title}</h2>
                    <p className="text-sm text-gray-500 font-mono mt-0.5">{mentor.email}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>

                <p className="text-gray-600 text-sm mt-4 leading-relaxed whitespace-pre-line">
                  {mentor.bio}
                </p>

                <div className="mt-5 flex items-center gap-2 text-indigo-600 font-bold text-lg">
                  <span>₹{Number(mentor.hourly_rate).toFixed(2)}</span>
                  <span className="text-xs text-gray-400 font-normal">/ session</span>
                </div>

                {/* Available Slots Section */}
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> Available Slots
                  </h4>

                  {!mentor.slots || mentor.slots.filter((s) => !s.is_booked).length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No available slots open right now.</p>
                  ) : (
                    <div className="space-y-2">
                      {mentor.slots
                        .filter((slot) => !slot.is_booked)
                        .map((slot) => (
                          <div
                            key={slot.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm border border-gray-100"
                          >
                            <div className="flex items-center gap-2 text-gray-700">
                              <Clock className="w-4 h-4 text-indigo-500" />
                              <span>
                                {new Date(slot.start_time).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                                ,{' '}
                                {new Date(slot.start_time).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}{' '}
                                -{' '}
                                {new Date(slot.end_time).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>

                            <button
                              onClick={() => handleBookSlot(slot, mentor)}
                              disabled={bookingSlotId === slot.id}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
                            >
                              {bookingSlotId === slot.id ? 'Connecting...' : 'Book Slot'}
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}