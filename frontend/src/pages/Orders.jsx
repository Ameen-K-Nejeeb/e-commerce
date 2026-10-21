// src/pages/Orders.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import {
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  MessageSquarePlus,
  Clock,
  Store,
  Star,
  Sparkles
} from "lucide-react";
import ReviewModal from "../components/ReviewModal";

export default function Orders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ticket State
  const [ticketModal, setTicketModal] = useState({
    open: false,
    orderId: null,
    productId: null,
    productName: "",
  });
  const [ticketData, setTicketData] = useState({
    ticket_type: "COMPLAINT",
    subject: "",
    description: "",
  });
  const [ticketStatus, setTicketStatus] = useState({ error: "", success: "" });

  // Review Modal State
  const [reviewModalState, setReviewModalState] = useState({
    isOpen: false,
    productId: null,
    productName: "",
    existingReview: null,
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("store/orders/");
      setItems(res.data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- TICKET HANDLERS ---
  const handleOpenTicket = (orderId, productId, productName) => {
    setTicketStatus({ error: "", success: "" });
    setTicketData({ ticket_type: "COMPLAINT", subject: "", description: "" });
    setTicketModal({ open: true, orderId, productId, productName });
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setTicketStatus({ error: "", success: "" });

    try {
      await api.post("store/complaints/", {
        order: ticketModal.orderId,
        product: ticketModal.productId,
        ticket_type: ticketData.ticket_type,
        subject: ticketData.subject,
        description: ticketData.description,
      });
      setTicketStatus({
        error: "",
        success: "Inquiry submitted securely to the artisan.",
      });
      setTimeout(
        () =>
          setTicketModal({
            open: false,
            orderId: null,
            productId: null,
            productName: "",
          }),
        1400
      );
    } catch (err) {
      setTicketStatus({
        error: "Failed to dispatch inquiry. Please check your details.",
        success: "",
      });
    }
  };

  // --- REVIEW HANDLERS ---
  const openReviewModal = (productId, productName, existingReview = null) => {
    setReviewModalState({ isOpen: true, productId, productName, existingReview });
  };

  const handleReviewSuccess = () => {
    fetchOrders(); 
  };

  const getItemStatusBadge = (status) => {
    const map = {
      CONFIRMED: { bg: "bg-stone-100 text-stone-700 border-stone-200", label: "Confirmed" },
      PAID: { bg: "bg-amber-50 text-amber-800 border-amber-200", label: "Paid Securely" },
      PROCESSING: { bg: "bg-orange-50 text-orange-800 border-orange-200", label: "Artisan Processing" },
      SHIPPED: { bg: "bg-amber-100 text-amber-900 border-amber-300", label: "In Transit" },
      OUT_FOR_DELIVERY: { bg: "bg-emerald-50 text-emerald-800 border-emerald-200", label: "Arriving Today" },
      DELIVERED: { bg: "bg-emerald-100 text-emerald-900 border-emerald-300", label: "Secured" },
      CANCELLED: { bg: "bg-rose-50 text-rose-800 border-rose-200", label: "Voided" },
    };
    const s = map[status] || {
      bg: "bg-stone-100 text-stone-700 border-stone-200",
      label: status ? status.replace(/_/g, " ") : "Confirmed",
    };
    return (
      <span className={`px-3 py-1 text-[9px] font-black rounded-full border uppercase tracking-widest ${s.bg}`}>
        {s.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 flex justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-[#faf8f5]/40 min-h-screen">
      <div className="mb-10 border-b border-amber-100/60 pb-6">
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-stone-900">Your Acquisitions</h1>
        <p className="text-xs uppercase tracking-widest font-bold text-amber-700/60 mt-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Tracking {items.length} Fine Piece{items.length === 1 ? "" : "s"}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-amber-100/60 p-16 text-center shadow-xl shadow-amber-900/5">
          <Package className="w-12 h-12 text-amber-200 mx-auto mb-4" />
          <h2 className="text-xl font-serif font-bold text-stone-800">No pieces acquired yet</h2>
          <p className="text-sm text-stone-500 mt-1 font-medium">
            Fine jewelry you purchase will appear here with secure transit tracking.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-amber-100/60 rounded-[2rem] shadow-sm hover:shadow-lg hover:shadow-amber-900/5 overflow-hidden transition-all"
            >
              {/* Shipment Header */}
              <div className="bg-stone-50/50 px-6 py-4 border-b border-amber-100/60 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap items-center gap-4 text-stone-500 font-medium">
                  <span className="font-mono font-bold text-stone-900 tracking-wider">
                    Ref #{item.order_id}-{item.id}
                  </span>
                  <span className="text-amber-200">•</span>
                  <span>
                    Acquired:{" "}
                    <strong className="text-stone-800">
                      {item.order_created_at
                        ? new Date(item.order_created_at).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Recent"}
                    </strong>
                  </span>
                  {item.vendor_store && (
                    <>
                      <span className="text-amber-200">•</span>
                      <span className="flex items-center gap-1.5 font-bold text-amber-800 uppercase tracking-wider text-[10px]">
                        <Store className="w-3.5 h-3.5" /> {item.vendor_store}
                      </span>
                    </>
                  )}
                </div>

                <div>{getItemStatusBadge(item.status)}</div>
              </div>

              {/* Item Details */}
              <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className="w-20 h-20 bg-[#fcfaf7] rounded-2xl flex items-center justify-center flex-shrink-0 text-stone-300 overflow-hidden border border-amber-100/50 shadow-inner">
                    {item.product_image ? (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-amber-200" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-serif font-bold text-stone-900">
                      {item.product_name || "Exclusive Piece"}
                    </h3>
                    {item.variant_name && (
                      <p className="text-[11px] uppercase tracking-widest text-amber-700 font-bold mt-1">
                        Spec: {item.variant_name}
                      </p>
                    )}
                    <p className="text-sm text-stone-500 mt-2 font-medium">
                      Qty: {item.quantity} × ₹{Number(item.unit_price).toFixed(2)} ={" "}
                      <strong className="text-stone-900 font-black">
                        ₹{(Number(item.unit_price) * item.quantity).toFixed(2)}
                      </strong>
                    </p>
                  </div>
                </div>

                {/* Actions: Report Issue & Rate Product */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOpenTicket(item.order_id, item.product, item.product_name)}
                    className="text-[10px] uppercase tracking-widest font-bold text-stone-500 hover:text-amber-700 bg-stone-50 hover:bg-amber-50 border border-stone-200 px-4 py-2.5 rounded-full transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    Support
                  </button>

                  {/* Show Stars if Reviewed, otherwise show Rate Product */}
                  {(item.status === "DELIVERED" || item.status === "PAID") && (
                    item.user_review ? (
                      <div className="flex items-center gap-2 bg-amber-50 pl-3 pr-1 py-1 rounded-full border border-amber-200/60 shadow-sm">
                        <span className="text-[9px] font-black text-amber-800 uppercase tracking-widest">
                          Reviewed
                        </span>
                        <div className="flex items-center mx-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < item.user_review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-amber-200"
                              }`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => openReviewModal(item.product, item.product_name, item.user_review)}
                          className="text-[9px] uppercase tracking-widest font-black text-stone-500 hover:text-amber-800 bg-white border border-amber-200 px-3 py-1.5 rounded-full shadow-sm"
                        >
                          Edit
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => openReviewModal(item.product, item.product_name)}
                        className="text-[10px] uppercase tracking-widest font-bold text-white bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 px-4 py-2.5 rounded-full transition-all flex items-center gap-1.5 shadow-md shadow-amber-600/20"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-200 text-amber-200" />
                        Appraise
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Individual Courier & Tracking Footer */}
              <div className="bg-stone-50/60 px-6 py-4 border-t border-amber-100/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                {item.tracking_carrier || item.tracking_number ? (
                  <div className="flex items-center gap-2 text-amber-900 font-bold uppercase tracking-wider text-[10px]">
                    <Truck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>
                      Carrier: <strong className="text-stone-800">{item.tracking_carrier || "Insured Transit"}</strong>
                    </span>
                    <span className="text-amber-200 mx-1">•</span>
                    <span>
                      AWB: <strong className="font-mono text-stone-900 tracking-widest">{item.tracking_number}</strong>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-stone-400 font-medium uppercase tracking-widest text-[9px]">
                    <Clock className="w-3 h-3" />
                    <span>Awaiting Artisan Dispatch</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complaint / Dispute Modal */}
      {ticketModal.open && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-amber-100/60">
            <h3 className="text-xl font-serif font-black text-stone-900 mb-1">Support Inquiry</h3>
            <p className="text-xs text-stone-500 mb-6 font-medium">
              Regarding <strong>{ticketModal.productName}</strong> (Ref #{ticketModal.orderId})
            </p>

            {ticketStatus.error && (
              <div className="mb-4 p-3.5 text-xs bg-rose-50 text-rose-800 rounded-xl flex items-center gap-2 border border-rose-200 font-bold">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                {ticketStatus.error}
              </div>
            )}
            {ticketStatus.success && (
              <div className="mb-4 p-3.5 text-xs bg-emerald-50 text-emerald-800 rounded-xl flex items-center gap-2 border border-emerald-200 font-bold">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                {ticketStatus.success}
              </div>
            )}

            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">Inquiry Type</label>
                <select
                  value={ticketData.ticket_type}
                  onChange={(e) => setTicketData({ ...ticketData, ticket_type: e.target.value })}
                  className="w-full text-sm p-3 border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 bg-stone-50 text-stone-800 transition-colors"
                >
                  <option value="COMPLAINT">Quality / Authenticity Concern</option>
                  <option value="DAMAGED_ITEM">Damaged in Transit</option>
                  <option value="RETURN_REQUEST">Return / Secure Refund</option>
                  <option value="SUGGESTION">General Support</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Brief summary..."
                  value={ticketData.subject}
                  onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                  className="w-full text-sm p-3 bg-stone-50 text-stone-900 border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 transition-colors placeholder:text-stone-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">Details</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Please provide full details so the artisan can assist you..."
                  value={ticketData.description}
                  onChange={(e) => setTicketData({ ...ticketData, description: e.target.value })}
                  className="w-full text-sm p-3 bg-stone-50 text-stone-900 border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 transition-colors placeholder:text-stone-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-50">
                <button
                  type="button"
                  onClick={() =>
                    setTicketModal({ open: false, orderId: null, productId: null, productName: "" })
                  }
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-stone-500 hover:bg-stone-100 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-black uppercase tracking-widest bg-stone-900 hover:bg-stone-800 text-white rounded-full shadow-md transition-all"
                >
                  Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalState.isOpen}
        productId={reviewModalState.productId}
        productName={reviewModalState.productName}
        existingReview={reviewModalState.existingReview}
        onClose={() => setReviewModalState({ isOpen: false, productId: null, productName: "", existingReview: null })}
        onReviewSuccess={handleReviewSuccess}
      />
    </div>
  );
}