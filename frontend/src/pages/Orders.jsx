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
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketModal, setTicketModal] = useState({
    open: false,
    orderId: null,
    productId: null,
  });
  const [ticketData, setTicketData] = useState({
    ticket_type: "COMPLAINT",
    subject: "",
    description: "",
  });
  const [ticketStatus, setTicketStatus] = useState({ error: "", success: "" });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("store/user/orders/");
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTicket = (orderId, productId) => {
    setTicketStatus({ error: "", success: "" });
    setTicketData({ ticket_type: "COMPLAINT", subject: "", description: "" });
    setTicketModal({ open: true, orderId, productId });
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
        success: "Complaint/Suggestion submitted successfully!",
      });
      setTimeout(
        () => setTicketModal({ open: false, orderId: null, productId: null }),
        1400,
      );
    } catch (err) {
      setTicketStatus({
        error: "Failed to submit ticket. Please check fields.",
        success: "",
      });
    }
  };

  // Endpoint inside Orders.jsx for submitting a review
  const submitReview = async (productId, rating, comment) => {
    await api.post("store/reviews/", {
      product_id: productId,
      rating: rating,
      comment: comment,
    });
    alert("Review submitted successfully!");
  };

  const getStatusBadge = (status) => {
    const map = {
      PAID: {
        bg: "bg-blue-50 text-blue-700 border-blue-200",
        label: "Payment Confirmed",
      },
      PROCESSING: {
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        label: "Processing",
      },
      SHIPPED: {
        bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
        label: "Shipped",
      },
      OUT_FOR_DELIVERY: {
        bg: "bg-purple-50 text-purple-700 border-purple-200",
        label: "Out for Delivery",
      },
      DELIVERED: {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        label: "Delivered",
      },
      CANCELLED: {
        bg: "bg-rose-50 text-rose-700 border-rose-200",
        label: "Cancelled",
      },
    };
    const s = map[status] || {
      bg: "bg-gray-100 text-gray-700 border-gray-200",
      label: status,
    };
    return (
      <span
        className={`px-2.5 py-1 text-xs font-bold rounded-full border ${s.bg}`}
      >
        {s.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Your Orders</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track parcel shipments and manage support requests.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-800">
            No orders placed yet
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Products you buy will show here along with live shipping statuses.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="bg-gray-50/70 p-4 sm:p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-6 text-xs text-gray-500">
                  <div>
                    <span className="block font-bold uppercase tracking-wider text-gray-400">
                      Order Placed
                    </span>
                    <span className="text-gray-800 font-medium">
                      {new Date(order.created_at).toLocaleDateString([], {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="block font-bold uppercase tracking-wider text-gray-400">
                      Total
                    </span>
                    <span className="text-gray-900 font-bold">
                      ₹{Number(order.total_amount).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="block font-bold uppercase tracking-wider text-gray-400">
                      Ship To
                    </span>
                    <span className="text-gray-800 font-medium">
                      {order.shipping_full_name || "Customer"}
                    </span>
                  </div>
                  <div>
                    <span className="block font-bold uppercase tracking-wider text-gray-400">
                      Order ID
                    </span>
                    <span className="text-gray-800 font-mono font-medium">
                      #{order.id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Carrier & Tracking Bar */}
              {(order.tracking_carrier || order.tracking_number) && (
                <div className="bg-indigo-50/50 px-6 py-2.5 border-b border-indigo-100 flex items-center gap-2 text-xs text-indigo-900 font-medium">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  <span>
                    Carrier:{" "}
                    <strong>{order.tracking_carrier || "Express"}</strong>
                  </span>
                  <span className="mx-1">•</span>
                  <span>
                    Tracking:{" "}
                    <strong className="font-mono">
                      {order.tracking_number}
                    </strong>
                  </span>
                </div>
              )}

              {/* Items Section */}
              <div className="p-4 sm:p-6 divide-y divide-gray-100">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 text-gray-400">
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">
                          {item.product_name || "Marketplace Item"}
                        </h3>
                        {item.variant_name && (
                          <p className="text-xs text-indigo-600 font-medium">
                            Option: {item.variant_name}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-0.5">
                          Qty: {item.quantity} × ₹
                          {Number(item.unit_price).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleOpenTicket(order.id, item.product)}
                        className="text-xs font-semibold text-gray-600 hover:text-indigo-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <MessageSquarePlus className="w-3.5 h-3.5" />
                        Report Issue
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complaint / Dispute Modal */}
      {ticketModal.open && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Submit Issue or Suggestion
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Direct message to administrator and vendor regarding Order #
              {ticketModal.orderId}.
            </p>

            {ticketStatus.error && (
              <div className="mb-3 p-3 text-xs bg-rose-50 text-rose-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{" "}
                {ticketStatus.error}
              </div>
            )}
            {ticketStatus.success && (
              <div className="mb-3 p-3 text-xs bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />{" "}
                {ticketStatus.success}
              </div>
            )}

            <form onSubmit={handleSubmitTicket} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                  Issue Type
                </label>
                <select
                  value={ticketData.ticket_type}
                  onChange={(e) =>
                    setTicketData({
                      ...ticketData,
                      ticket_type: e.target.value,
                    })
                  }
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="COMPLAINT">Product Quality / Complaint</option>
                  <option value="DAMAGED_ITEM">
                    Defective or Damaged Item
                  </option>
                  <option value="RETURN_REQUEST">
                    Return / Refund Request
                  </option>
                  <option value="SUGGESTION">
                    Suggestion / Store Feedback
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="Brief summary of the problem"
                  value={ticketData.subject}
                  onChange={(e) =>
                    setTicketData({ ...ticketData, subject: e.target.value })
                  }
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide full details so we can investigate and assist you..."
                  value={ticketData.description}
                  onChange={(e) =>
                    setTicketData({
                      ...ticketData,
                      description: e.target.value,
                    })
                  }
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setTicketModal({
                      open: false,
                      orderId: null,
                      productId: null,
                    })
                  }
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  Send Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
