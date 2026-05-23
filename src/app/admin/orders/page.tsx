'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Loader2, RefreshCw } from 'lucide-react';

interface User {
  name: string;
  email: string;
}

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

interface Order {
  _id: string;
  user?: User;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (res.ok) {
        setOrders(data);
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

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: string, field: 'orderStatus' | 'paymentStatus', value: string) => {
    const updatingToast = toast.loading(`Updating ${field === 'orderStatus' ? 'Order' : 'Payment'} status...`);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('Status updated successfully!', { id: updatingToast });
        // Update local state smoothly
        setOrders((prev) =>
          prev.map((order) =>
            order._id === id ? { ...order, [field]: value } : order
          )
        );
      } else {
        toast.error(data.error || 'Failed to update status', { id: updatingToast });
      }
    } catch {
      toast.error('An error occurred during update', { id: updatingToast });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-xs font-black uppercase tracking-widest text-text gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
        <span>Retrieving Orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h1 className="text-3xl font-display font-black uppercase tracking-tighter">
          Order Management
        </h1>
        <button
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="flex items-center gap-2 border border-border px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-card transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

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
              <tr key={order._id} className="hover:bg-bg/50 transition-colors">
                {/* ID & Hover Info */}
                <td className="p-4 font-mono select-all text-muted" title={order._id}>
                  #{order._id.slice(-6)}
                </td>
                {/* Customer Details */}
                <td className="p-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-text">{order.user?.name || 'Guest User'}</span>
                    <span className="text-[9px] text-muted normal-case font-semibold tracking-normal">
                      {order.user?.email || 'N/A'}
                    </span>
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
                {/* Date */}
                <td className="p-4 text-muted">
                  {new Date(order.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
                {/* Total */}
                <td className="p-4 text-text font-black">
                  ₹{order.totalAmount.toLocaleString('en-IN')}
                </td>
                {/* Payment Status Dropdown */}
                <td className="p-4">
                  <select
                    value={order.paymentStatus}
                    onChange={(e) => handleStatusChange(order._id, 'paymentStatus', e.target.value)}
                    className={`border text-[10px] font-black uppercase tracking-widest p-2 outline-none cursor-pointer transition-colors ${
                      order.paymentStatus === 'Paid'
                        ? 'bg-accent/10 border-accent/40 text-text'
                        : order.paymentStatus === 'Failed'
                        ? 'bg-accent-red/10 border-accent-red/40 text-accent-red'
                        : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Failed">Failed</option>
                  </select>
                </td>
                {/* Order Status Dropdown */}
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
              <tr>
                <td colSpan={6} className="p-12 text-center text-muted font-bold text-xs uppercase tracking-widest">
                  No orders have been received yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
