// src/pages/Orders.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Package, Truck, CheckCircle2, AlertCircle, MessageSquarePlus, Clock, Store, Star, Sparkles } from "lucide-react";
import ReviewModal from "../components/ReviewModal";

export default function Orders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketModal, setTicketModal] = useState({ open: false, orderId: null, productId: null, productName: "" });
  const [ticketData, setTicketData] = useState({ ticket_type: "COMPLAINT", subject: "", description: "" });
  const [ticketStatus, setTicketStatus] = useState({ error: "", success: "" });
  const [reviewModalState, setReviewModalState] = useState({ isOpen: false, productId: null, productName: "", existingReview: null });

  useEffect(() => { fetchOrders(); }, []);
  const fetchOrders = async () => {
    setLoading(true);
    try { const res = await api.get("store/orders/"); setItems(res.data || []); }
    catch (err) {} finally { setLoading(false); }
  };

  const handleOpenTicket = (orderId, productId, productName) => {
    setTicketStatus({ error: "", success: "" }); setTicketData({ ticket_type: "COMPLAINT", subject: "", description: "" }); setTicketModal({ open: true, orderId, productId, productName });
  };
  const handleSubmitTicket = async (e) => {
    e.preventDefault(); setTicketStatus({ error: "", success: "" });
    try {
      await api.post("store/complaints/", { order: ticketModal.orderId, product: ticketModal.productId, ...ticketData });
      setTicketStatus({ success: "Inquiry submitted to the fashion house." });
      setTimeout(() => setTicketModal({ open: false, orderId: null, productId: null, productName: "" }), 1400);
    } catch (err) { setTicketStatus({ error: "Failed to dispatch inquiry." }); }
  };

  const openReviewModal = (productId, productName, existingReview = null) => { setReviewModalState({ isOpen: true, productId, productName, existingReview }); };
  const handleReviewSuccess = () => { fetchOrders(); };

  const getItemStatusBadge = (status) => {
    const s = status ? status.replace(/_/g, " ") : "Confirmed";
    return <span className="px-3 py-1 text-[9px] font-black rounded-full border uppercase tracking-widest bg-[#C9A96A]/20 text-[#C9A96A] border-[#C9A96A]/50">{s}</span>;
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-32 flex justify-center bg-[#080808] min-h-screen"><div className="w-10 h-10 border-4 border-[#C9A96A] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5E6D3]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#C9A96A]">Wardrobe Additions</h1>
        <p className="text-xs uppercase tracking-widest font-bold text-[#F5E6D3]/60 mt-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#C9A96A]" /> Tracking {items.length} Designer Piece{items.length === 1 ? "" : "s"}
        </p>

        <div className="mt-10">
          {items.length === 0 ? (
            <div className="bg-[#111111] rounded-3xl border border-[#C9A96A]/30 p-16 text-center">
              <Package className="w-12 h-12 text-[#C9A96A] mx-auto mb-4" />
              <h2 className="text-xl font-serif font-bold text-[#F5E6D3]">No pieces acquired yet</h2>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="bg-[#111111] border border-[#C9A96A]/20 rounded-[2rem] overflow-hidden">
                  <div className="bg-[#1a1a1a] px-6 py-4 border-b border-[#C9A96A]/20 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="flex gap-4 text-[#F5E6D3]/60 font-medium items-center">
                      <span className="font-mono text-[#C9A96A]">Ref #{item.order_id}-{item.id}</span>
                      {item.vendor_store && <span className="flex items-center gap-1 text-[#C9A96A]"><Store className="w-3 h-3"/> {item.vendor_store}</span>}
                    </div>
                    {getItemStatusBadge(item.status)}
                  </div>
                  <div className="p-6 flex flex-col md:flex-row gap-6">
                    <div className="flex gap-5">
                      <div className="w-20 h-20 bg-[#080808] border border-[#C9A96A]/30 rounded-2xl overflow-hidden flex items-center justify-center">
                        {item.product_image ? <img src={item.product_image} alt="" className="w-full h-full object-cover" /> : <Package className="w-8 h-8 text-[#C9A96A]" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-serif font-bold text-[#F5E6D3]">{item.product_name}</h3>
                        {item.variant_name && <p className="text-[11px] uppercase tracking-widest text-[#C9A96A] mt-1">Size/Color: {item.variant_name}</p>}
                        <p className="text-sm text-[#F5E6D3]/60 mt-2">Qty: {item.quantity} × ₹{Number(item.unit_price).toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 ml-auto">
                      <button onClick={() => handleOpenTicket(item.order_id, item.product, item.product_name)} className="text-[10px] uppercase tracking-widest font-bold text-[#F5E6D3]/60 hover:text-[#C9A96A] border border-[#C9A96A]/30 px-4 py-2 rounded-full flex items-center gap-1.5 transition-colors">
                        <MessageSquarePlus className="w-3 h-3" /> Support
                      </button>
                      
                      {/* --- REDESIGNED REVIEW BUTTONS --- */}
                      {(item.status === "DELIVERED" || item.status === "PAID") && (
                        item.user_review ? (
                          <div className="flex items-center gap-2 bg-[#C9A96A]/10 pl-3 pr-1.5 py-1.5 rounded-full border border-[#C9A96A]/30">
                            <span className="text-[9px] font-black text-[#C9A96A] uppercase tracking-widest flex items-center gap-1">
                              <Star className="w-3 h-3 fill-[#C9A96A]" /> Reviewed
                            </span>
                            <button
                              onClick={() => openReviewModal(item.product, item.product_name, item.user_review)}
                              className="text-[9px] uppercase tracking-widest font-bold text-[#080808] hover:bg-[#B38D46] bg-[#C9A96A] px-3 py-1 rounded-full transition-colors"
                            >
                              Edit
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => openReviewModal(item.product, item.product_name)}
                            className="text-[10px] uppercase tracking-widest font-bold text-[#080808] bg-gradient-to-r from-[#C9A96A] to-[#B38D46] hover:brightness-110 px-4 py-2 rounded-full transition-all flex items-center gap-1.5 shadow-md shadow-[#C9A96A]/10"
                          >
                            <Star className="w-3.5 h-3.5 fill-[#080808] text-[#080808]" />
                            Review
                          </button>
                        )
                      )}
                      {/* ---------------------------------- */}
                      
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <ReviewModal isOpen={reviewModalState.isOpen} productId={reviewModalState.productId} productName={reviewModalState.productName} existingReview={reviewModalState.existingReview} onClose={() => setReviewModalState({isOpen:false})} onReviewSuccess={handleReviewSuccess}/>
        
        {/* Ticket Modal */}
        {ticketModal.open && (
          <div className="fixed inset-0 z-50 bg-[#080808]/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111111] rounded-3xl max-w-md w-full p-8 border border-[#C9A96A]/30 shadow-2xl">
              <h3 className="text-xl font-serif font-black text-[#C9A96A] mb-1">Support Inquiry</h3>
              <form onSubmit={handleSubmitTicket} className="space-y-4 mt-4">
                <select value={ticketData.ticket_type} onChange={(e) => setTicketData({ ...ticketData, ticket_type: e.target.value })} className="w-full text-sm p-3 bg-[#080808] border border-[#C9A96A]/30 rounded-xl text-[#F5E6D3] outline-none focus:border-[#C9A96A]">
                  <option value="COMPLAINT">Quality / Sizing Concern</option>
                  <option value="DAMAGED_ITEM">Damaged in Transit</option>
                  <option value="RETURN_REQUEST">Return / Refund</option>
                  <option value="SUGGESTION">General Support</option>
                </select>
                <input type="text" placeholder="Subject..." value={ticketData.subject} onChange={(e) => setTicketData({...ticketData, subject: e.target.value})} className="w-full p-3 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none focus:border-[#C9A96A]" />
                <textarea rows={4} placeholder="Details..." value={ticketData.description} onChange={(e) => setTicketData({...ticketData, description: e.target.value})} className="w-full p-3 bg-[#080808] border border-[#C9A96A]/30 text-[#F5E6D3] rounded-xl outline-none focus:border-[#C9A96A]" />
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={()=>setTicketModal({open:false})} className="px-5 py-2 text-xs font-bold text-[#F5E6D3]/60 hover:text-white uppercase transition-colors">Cancel</button>
                  <button type="submit" className="px-6 py-2 text-xs font-black uppercase bg-[#C9A96A] hover:bg-[#B38D46] text-[#080808] rounded-full transition-colors">Dispatch</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}