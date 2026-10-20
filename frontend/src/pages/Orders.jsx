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
} from "lucide-react";

export default function Orders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Calls UserOrdersView which returns the flat list of items
      const res = await api.get("store/orders/");
      console.log("Customer orders received:", res.data);
      setItems(res.data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

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
        success: "Complaint/Suggestion submitted successfully!",
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
        error: "Failed to submit ticket. Please check fields.",
        success: "",
      });
    }
  };

  const getItemStatusBadge = (status) => {
    const map = {
      CONFIRMED: {
        bg: "bg-blue-50 text-blue-700 border-blue-200",
        label: "Confirmed",
      },
      PAID: {
        bg: "bg-blue-50 text-blue-700 border-blue-200",
        label: "Confirmed",
      },
      PROCESSING: {
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        label: "Processing by Seller",
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
      label: status ? status.replace(/_/g, " ") : "Confirmed",
    };
    return (
      <span
        className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border uppercase tracking-wider ${s.bg}`}
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Your Shipments</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tracking {items.length} item{items.length === 1 ? "" : "s"} across independent seller dispatches.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-800">No orders placed yet</h2>
          <p className="text-sm text-gray-400 mt-1">
            Products you buy will show here with separate seller dispatch tracking.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden hover:border-gray-200 transition-all"
            >
              {/* Shipment Header */}
              <div className="bg-gray-50/70 px-5 py-3.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4 text-gray-500">
                  <span className="font-mono font-bold text-gray-900">
                    Order #{item.order_id} • Item #{item.id}
                  </span>
                  <span>•</span>
                  <span>
                    Placed on:{" "}
                    <strong className="text-gray-700">
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
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-gray-700">
                        <Store className="w-3.5 h-3.5 text-gray-400" />
                        Seller: {item.vendor_store}
                      </span>
                    </>
                  )}
                </div>

                <div>{getItemStatusBadge(item.status)}</div>
              </div>

              {/* Item Details */}
              <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-gray-400 overflow-hidden border border-gray-100">
                    {item.product_image ? (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-gray-300" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      {item.product_name || "Marketplace Product"}
                    </h3>
                    {item.variant_name && (
                      <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                        Variant: {item.variant_name}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Qty: {item.quantity} × ₹{Number(item.unit_price).toFixed(2)} ={" "}
                      <strong className="text-gray-900 font-bold">
                        ₹{(Number(item.unit_price) * item.quantity).toFixed(2)}
                      </strong>
                    </p>
                  </div>
                </div>

                {/* Report Issue Action */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      handleOpenTicket(
                        item.order_id,
                        item.product,
                        item.product_name
                      )
                    }
                    className="text-xs font-semibold text-gray-600 hover:text-indigo-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    Report Issue
                  </button>
                </div>
              </div>

              {/* Individual Courier & Tracking Footer */}
              <div className="bg-indigo-50/40 px-5 py-3 border-t border-indigo-50 flex flex-wrap items-center justify-between gap-2 text-xs">
                {item.tracking_carrier || item.tracking_number ? (
                  <div className="flex items-center gap-2 text-indigo-900 font-medium">
                    <Truck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>
                      Courier:{" "}
                      <strong>{item.tracking_carrier || "Standard Delivery"}</strong>
                    </span>
                    <span className="text-indigo-300">•</span>
                    <span>
                      AWB / Tracking:{" "}
                      <strong className="font-mono text-gray-900">
                        {item.tracking_number}
                      </strong>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-gray-400 italic">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Awaiting seller fulfillment and courier dispatch</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complaint / Dispute Modal */}
      {ticketModal.open && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Submit Issue / Complaint
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Regarding <strong>{ticketModal.productName}</strong> (Order #{ticketModal.orderId})
            </p>

            {ticketStatus.error && (
              <div className="mb-3 p-3 text-xs bg-rose-50 text-rose-700 rounded-xl flex items-center gap-2 border border-rose-100">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {ticketStatus.error}
              </div>
            )}
            {ticketStatus.success && (
              <div className="mb-3 p-3 text-xs bg-emerald-50 text-emerald-700 rounded-xl flex items-center gap-2 border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
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
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="COMPLAINT">Product Quality / Complaint</option>
                  <option value="DAMAGED_ITEM">Defective or Damaged Item</option>
                  <option value="RETURN_REQUEST">Return / Refund Request</option>
                  <option value="SUGGESTION">Suggestion / Store Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="Brief summary of the issue"
                  value={ticketData.subject}
                  onChange={(e) =>
                    setTicketData({ ...ticketData, subject: e.target.value })
                  }
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
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
                      productName: "",
                    })
                  }
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all"
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