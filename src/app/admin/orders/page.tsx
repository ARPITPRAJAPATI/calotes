'use client'; // Flags this file as a client component to handle local statuses, dropdown modifications, API calls, and alerts

// Import React hooks
import { useState, useEffect } from 'react';
// Import hot toast notification helpers
import toast from 'react-hot-toast';
// Import UI vector graphics icons
import { Loader2, RefreshCw, X } from 'lucide-react';

// Struct definition of User references
interface User {
  name: string;
  email: string;
}

// Struct layout of Order Items
interface OrderItem {
  product: {
    name: string;
    images?: string[];
  };
  name: string;
  size: string;
  price: number;
  quantity: number;
  image?: string;
}

// Struct representing Order entities mapping database objects
interface Order {
  _id: string;
  user?: User;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: string;
  paymentMethod?: string;
  paidAmount?: number;
  codAmountDue?: number;
  codFee?: number;
  orderStatus: string;
  createdAt: string;
  shippingAddress: {
    fullName?: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]); // Holds full list of orders
  const [loading, setLoading] = useState(true);      // Loader status indicator spinner
  const [refreshing, setRefreshing] = useState(false); // Refresher loader control
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // State for modal details view

  // Fetch orders from database APIs
  const fetchOrders = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (res.ok) {
        setOrders(data); // Hydrate order state list
      } else {
        toast.error(data.error || 'Failed to load orders');
      }
    } catch {
      toast.error('An error occurred loading orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Run fetch query when page loads initially
  useEffect(() => {
    fetchOrders();
  }, []);

  // PUT updates on specific order parameters (orderStatus or paymentStatus)
  const handleStatusChange = async (id: string, field: 'orderStatus' | 'paymentStatus', value: string) => {
    const updatingToast = toast.loading(`Updating ${field === 'orderStatus' ? 'Order' : 'Payment'} status...`); // Launch progress toast
    try {
      // Trigger update API endpoint PUT methods
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('Status updated successfully!', { id: updatingToast }); // Update to success status
        // Sync local React state smoothly to update page layout in-place immediately
        setOrders((prev) =>
          prev.map((order) =>
            order._id === id ? { ...order, [field]: value } : order
          )
        );
        // Sync selectedOrder if it is currently open
        setSelectedOrder((prev) =>
          prev && prev._id === id ? { ...prev, [field]: value } : prev
        );
      } else {
        toast.error(data.error || 'Failed to update status', { id: updatingToast });
      }
    } catch {
      toast.error('An error occurred during update', { id: updatingToast });
    }
  };

  if (loading) {
    // Full screen loader spinner
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-xs font-black uppercase tracking-widest text-text gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
        <span>Retrieving Orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HUD Page Header */}
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h1 className="text-3xl font-display font-black uppercase tracking-tighter">
          Order Management
        </h1>
        <button
          onClick={() => fetchOrders(true)} // Silent background fetch refresh call
          disabled={refreshing}
          className="flex items-center gap-2 border border-border px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-card transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Orders Table layout wrapper */}
      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[900px]">
          <thead className="bg-bg text-[10px] font-black uppercase tracking-widest text-muted border-b border-border">
            <tr>
              <th className="p-4 w-28">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4 w-32">Date</th>
              <th className="p-4 w-32">Total</th>
              <th className="p-4 w-44">Payment Status</th>
              <th className="p-4 w-48">Order Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-bold uppercase tracking-widest text-xs">
            {orders.map((order) => (
              <tr
                key={order._id}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.tagName !== 'SELECT' && target.tagName !== 'OPTION') {
                    setSelectedOrder(order);
                  }
                }}
                className="hover:bg-bg/50 transition-colors cursor-pointer"
              >
                {/* Order references ID codes */}
                <td className="p-4 font-mono select-all text-muted" title={order._id}>
                  #{order._id.slice(-6)}
                </td>
                
                {/* Customer parameter columns */}
                <td className="p-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-text">{order.user?.name || 'Guest User'}</span>
                    <span className="text-[9px] text-muted normal-case font-semibold tracking-normal">
                      {order.user?.email || 'N/A'}
                    </span>
                    {/* List sub-items of purchase bundle */}
                    <div className="mt-2 flex flex-col gap-1.5 text-[8px] text-muted tracking-wider">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 border-t border-border/30 pt-1 mt-1 first:border-0 first:pt-0 first:mt-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-5 h-6 object-cover border border-border/20 shrink-0" />
                          ) : (
                            <div className="w-5 h-6 bg-muted/20 border border-border/20 flex items-center justify-center text-[5px] shrink-0">
                              N/A
                            </div>
                          )}
                          <span className="line-clamp-1 max-w-[200px]">
                            {item.name} ({item.size}) x{item.quantity} - ₹{item.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </td>
                
                {/* Dates */}
                <td className="p-4 text-muted">
                  {new Date(order.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
                
                {/* Totals */}
                <td className="p-4 text-text font-black">
                  ₹{order.totalAmount.toLocaleString('en-IN')}
                  {order.paymentMethod === 'Partial COD' && (
                    <div className="mt-1 space-y-0.5 text-[8px] font-mono">
                      <span className="block text-emerald-600 font-bold">Paid: ₹{(order.paidAmount || 0).toLocaleString('en-IN')}</span>
                      <span className="block text-terracotta font-bold">Due: ₹{(order.codAmountDue || 0).toLocaleString('en-IN')} (COD)</span>
                    </div>
                  )}
                </td>
                
                {/* Payment Status Dropdown select */}
                <td className="p-4">
                  <select
                    value={order.paymentStatus}
                    onChange={(e) => handleStatusChange(order._id, 'paymentStatus', e.target.value)}
                    className={`border text-[10px] font-black uppercase tracking-widest p-2 outline-none cursor-pointer transition-colors ${
                      order.paymentStatus === 'Paid'
                        ? 'bg-accent/10 border-accent/40 text-text'
                        : order.paymentStatus === 'Partial Paid'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                        : order.paymentStatus === 'Failed'
                        ? 'bg-accent-red/10 border-accent-red/40 text-accent-red'
                        : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Partial Paid">Partial Paid</option>
                    <option value="Failed">Failed</option>
                  </select>
                </td>
                
                {/* Delivery Order Status Dropdown select */}
                <td className="p-4">
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(order._id, 'orderStatus', e.target.value)}
                    className={`border text-[10px] font-black uppercase tracking-widest p-2 outline-none cursor-pointer transition-colors ${
                      order.orderStatus === 'Delivered'
                        ? 'bg-accent/15 border-accent/45 text-text'
                        : order.orderStatus === 'Shipped'
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-600'
                        : order.orderStatus === 'Cancelled'
                        ? 'bg-accent-red/15 border-accent-red/45 text-accent-red'
                        : 'bg-card border-border text-muted'
                    }`}
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              // Empty fallback
              <tr>
                <td colSpan={6} className="p-12 text-center text-muted font-bold text-xs uppercase tracking-widest">
                  No orders have been received yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Premium Order Details Modal */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300"
          onClick={() => setSelectedOrder(null)}
        >
          <div 
            className="bg-card border border-border w-full max-w-3xl max-h-[92vh] overflow-y-auto relative p-6 md:p-10 flex flex-col gap-8 shadow-2xl shadow-black/30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b border-border/40 pb-6 pr-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-terracotta"></span>
                  <span className="text-[10px] font-black text-terracotta uppercase tracking-[0.2em]">Order Detail Panel</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-black uppercase tracking-tight select-all text-text">
                  #{selectedOrder._id}
                </h2>
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="absolute top-6 right-6 p-2 text-muted hover:text-text hover:bg-card border border-border/20 rounded-none transition-all duration-200"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Status Control Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-bg/50 p-5 border border-border/30">
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black text-muted uppercase tracking-[0.15em]">Payment Status</span>
                <select
                  value={selectedOrder.paymentStatus}
                  onChange={(e) => handleStatusChange(selectedOrder._id, 'paymentStatus', e.target.value)}
                  className={`w-full border text-[10px] font-black uppercase tracking-widest p-3 outline-none cursor-pointer transition-all duration-200 ${
                    selectedOrder.paymentStatus === 'Paid'
                      ? 'bg-accent/5 border-accent/30 text-accent hover:border-accent/60'
                      : selectedOrder.paymentStatus === 'Failed'
                      ? 'bg-accent-red/5 border-accent-red/30 text-accent-red hover:border-accent-red/60'
                      : 'bg-yellow-500/5 border-yellow-500/20 text-yellow-600 hover:border-yellow-500/55'
                  }`}
                >
                  <option value="Pending" className="bg-card text-text">Pending</option>
                  <option value="Paid" className="bg-card text-text">Paid</option>
                  <option value="Partial Paid" className="bg-card text-text">Partial Paid</option>
                  <option value="Failed" className="bg-card text-text">Failed</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black text-muted uppercase tracking-[0.15em]">Fulfillment Status</span>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleStatusChange(selectedOrder._id, 'orderStatus', e.target.value)}
                  className={`w-full border text-[10px] font-black uppercase tracking-widest p-3 outline-none cursor-pointer transition-all duration-200 ${
                    selectedOrder.orderStatus === 'Delivered'
                      ? 'bg-accent/10 border-accent/30 text-accent hover:border-accent/60'
                      : selectedOrder.orderStatus === 'Shipped'
                      ? 'bg-blue-500/5 border-blue-500/20 text-blue-600 hover:border-blue-500/55'
                      : selectedOrder.orderStatus === 'Cancelled'
                      ? 'bg-accent-red/10 border-accent-red/30 text-accent-red hover:border-accent-red/60'
                      : 'bg-card border-border/40 text-muted hover:border-text/40'
                  }`}
                >
                  <option value="Processing" className="bg-card text-text">Processing</option>
                  <option value="Shipped" className="bg-card text-text">Shipped</option>
                  <option value="Delivered" className="bg-card text-text">Delivered</option>
                  <option value="Cancelled" className="bg-card text-text">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Customer & Shipping Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[11px] uppercase tracking-wider font-bold">
              {/* Customer Info */}
              <div className="space-y-4 border-l-2 border-border/30 pl-5 py-1">
                <h3 className="text-[10px] font-black text-terracotta tracking-[0.15em] uppercase">Customer Info</h3>
                <div className="space-y-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-muted tracking-widest uppercase">Name</span>
                    <span className="text-text font-black text-xs">{selectedOrder.user?.name || 'Guest User'}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-muted tracking-widest uppercase">Email</span>
                    <span className="text-text font-bold normal-case tracking-normal text-xs">{selectedOrder.user?.email || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-muted tracking-widest uppercase">Contact Phone</span>
                    <span className="text-text font-mono tracking-widest text-xs">{selectedOrder.shippingAddress?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-4 border-l-2 border-border/30 pl-5 py-1">
                <h3 className="text-[10px] font-black text-terracotta tracking-[0.15em] uppercase">Delivery Address</h3>
                <div className="space-y-1 text-xs text-text font-black">
                  <div className="text-sm font-black mb-1">{selectedOrder.shippingAddress?.fullName || selectedOrder.user?.name || 'Guest User'}</div>
                  <div className="text-muted font-semibold normal-case tracking-wide text-xs">{selectedOrder.shippingAddress?.street}</div>
                  <div className="text-muted font-semibold normal-case tracking-wide text-xs">
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.postalCode}
                  </div>
                  <div className="text-muted font-bold tracking-widest text-xs uppercase">{selectedOrder.shippingAddress?.country}</div>
                </div>
              </div>
            </div>

            {/* Items Ordered List */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-terracotta uppercase tracking-[0.15em] pb-2 border-b border-border/20">Items Details</h3>
              <div className="divide-y divide-border/20 max-h-[280px] overflow-y-auto pr-1">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center py-4 first:pt-0 last:pb-0 group">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-14 h-16 object-cover border border-border/40 group-hover:border-text/40 transition-colors shrink-0" />
                    ) : (
                      <div className="w-14 h-16 bg-card border border-border/40 flex items-center justify-center text-[8px] text-muted shrink-0">
                        NO IMAGE
                      </div>
                    )}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="text-xs font-black uppercase text-text tracking-wide truncate group-hover:text-terracotta transition-colors">{item.name}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-muted font-bold">
                        <span>Size: <span className="text-text font-black">{item.size}</span></span>
                        <span>Quantity: <span className="text-text font-black">{item.quantity}</span></span>
                        <span>Unit Price: <span className="text-text font-black">₹{item.price.toLocaleString('en-IN')}</span></span>
                      </div>
                    </div>
                    <div className="text-right text-xs font-black text-text font-mono tracking-widest shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Meta Info & Total */}
            <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="space-y-1.5 font-mono text-[9px] text-muted uppercase tracking-[0.1em]">
                {selectedOrder.razorpayOrderId && (
                  <div className="flex gap-2">
                    <span className="text-muted/60 w-24">Razorpay Order:</span>
                    <span className="text-text select-all font-semibold">{selectedOrder.razorpayOrderId}</span>
                  </div>
                )}
                {selectedOrder.razorpayPaymentId && (
                  <div className="flex gap-2">
                    <span className="text-muted/60 w-24">Razorpay Pay:</span>
                    <span className="text-text select-all font-semibold">{selectedOrder.razorpayPaymentId}</span>
                  </div>
                )}
              </div>
              <div className="w-full sm:w-auto flex justify-between sm:justify-end items-center gap-8 border-t sm:border-t-0 border-border/20 pt-4 sm:pt-0 shrink-0">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Grand Total</span>
                <span className="text-2xl font-display font-black text-text tracking-tight font-mono">
                  ₹{selectedOrder.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

