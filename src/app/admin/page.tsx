import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { IndianRupee, Package, ShoppingBag, Users } from "lucide-react";

export default async function AdminDashboard() {
  await connectDB();

  const totalOrders = await Order.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalUsers = await User.countDocuments();
  
  const orders = await Order.find({ paymentStatus: "Paid" });
  const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

  const stats = [
    { title: "Total Revenue", value: `₹${totalRevenue}`, icon: <IndianRupee size={24} /> },
    { title: "Total Orders", value: totalOrders, icon: <Package size={24} /> },
    { title: "Products", value: totalProducts, icon: <ShoppingBag size={24} /> },
    { title: "Customers", value: totalUsers, icon: <Users size={24} /> },
  ];

  return (
    <div className="space-y-12">
      <h1 className="text-4xl font-display font-black uppercase tracking-tighter">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card border border-border p-6 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start text-muted">
              <h3 className="text-[10px] font-black uppercase tracking-widest">{stat.title}</h3>
              {stat.icon}
            </div>
            <p className="text-3xl font-black uppercase tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
           <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 border-b border-border pb-2">Recent Orders</h2>
           <div className="bg-card border border-border p-8 flex flex-col items-center justify-center h-64 text-muted text-xs font-bold uppercase tracking-widest">
             See Orders Tab for details
           </div>
        </div>
        <div>
           <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 border-b border-border pb-2">Inventory Status</h2>
           <div className="bg-card border border-border p-8 flex flex-col items-center justify-center h-64 text-muted text-xs font-bold uppercase tracking-widest">
             All systems optimal
           </div>
        </div>
      </div>
    </div>
  );
}
