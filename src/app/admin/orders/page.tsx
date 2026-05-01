import connectDB from "@/lib/db";
import Order from "@/models/Order";

export default async function AdminOrdersPage() {
  await connectDB();
  
  // Fetch orders, sorted by newest
  const orders = await Order.find()
    .populate('user', 'name email')
    .sort('-createdAt');

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-display font-black uppercase tracking-tighter border-b border-border pb-4">
        Order Management
      </h1>

      <div className="bg-card border border-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-bg text-[10px] font-black uppercase tracking-widest text-muted border-b border-border">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Date</th>
              <th className="p-4">Total</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-bold uppercase tracking-widest text-xs">
            {orders.map((order) => (
              <tr key={order._id.toString()} className="hover:bg-bg/50 transition-colors">
                <td className="p-4 font-mono">{order._id.toString().slice(-6)}</td>
                <td className="p-4">{(order.user as any)?.name || 'Guest'}</td>
                <td className="p-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="p-4">₹{order.totalAmount}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-[10px] ${order.paymentStatus === 'Paid' ? 'bg-accent/20 text-text' : 'bg-accent-red/20 text-accent-red'}`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="p-4">
                  <select 
                    defaultValue={order.orderStatus}
                    className="bg-transparent border border-border text-[10px] font-black uppercase tracking-widest p-2 outline-none cursor-pointer"
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
                <td colSpan={6} className="p-8 text-center text-muted">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
