"use client"; // Flags this file as a client component (uses browser state, session providers, and API requests)

// Import session hook and signOut callbacks from NextAuth
import { useSession, signOut } from "next-auth/react";
// Import state and lifecycle hooks
import { useEffect, useState } from "react";
// Import router hook redirects
import { useRouter } from "next/navigation";
// Import UI vector icons
import { Loader2, Package, LogOut, ArrowRight, ArrowUpRight, Calendar, Tag, Truck } from "lucide-react";
// Import Link for page transitions
import Link from "next/link";

// Struct mapping order list items
interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
  _id: string;
}

// Struct layout of Orders returned from database API routes
interface UserOrder {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  orderStatus: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession(); // Access NextAuth session credentials
  const router = useRouter(); // Initialize router redirects
  const [orders, setOrders] = useState<UserOrder[]>([]); // Holds list of user order items
  const [loadingOrders, setLoadingOrders] = useState(true); // Tracks fetch progress loaders

  // Redirect users to Login if session status is unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/profile"); // Append callback parameter to return after successful login
    }
  }, [status, router]);

  // Fetch orders from database after session authentication finishes successfully
  useEffect(() => {
    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status]);

  // Query order history API endpoints to fetch items matching authenticated user email
  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders/user");
      if (res.ok) {
        const data = await res.json();
        setOrders(data); // Hydrate order state lists
      }
    } catch (err) {
      console.error("Failed to load user orders", err);
    } finally {
      setLoadingOrders(false); // Stop loading indicator spinners
    }
  };

  // Render full screen loader while NextAuth resolves user session
  if (status === "loading" || status === "unauthenticated") return (
    <div className="h-[70vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-accent" />
    </div>
  );

  return (
    <div className="w-full pt-32 pb-24 flex-1">
      {/* HUD Header Bar */}
      <div className="px-6 md:px-12 max-w-[1800px] mx-auto border-b border-border pb-8 mb-16 flex justify-between items-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">The Vault — Account</p>
        <button 
          onClick={() => router.back()} // Go back to last page
          className="text-[10px] font-black uppercase tracking-[0.2em] text-muted hover:text-text transition-colors"
        >
          Back
        </button>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Left Column: Account Profile Details Sidebar */}
          <aside className="lg:col-span-3 space-y-12">
            <div>
              <h1 className="font-display font-black text-4xl uppercase tracking-tighter mb-2">
                {session?.user?.name?.split(' ')[0]} {/* Display first name */}
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{session?.user?.email}</p>
            </div>
            <nav className="space-y-4 border-t border-border pt-8">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-4">Account</p>
              <Link href="/shop" className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest hover:text-accent transition-colors group">
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-accent" /> Continue Shopping
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })} // Terminate session and redirect to homepage
                className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-muted hover:text-accent transition-colors"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </nav>
          </aside>

          {/* Right Column: Interactive Order History List */}
          <div className="lg:col-span-9">
            <div className="flex justify-between items-end border-b border-border pb-4 mb-12">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Order History</h2>
            </div>

            {loadingOrders ? (
              // Loader progress spinner
              <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-accent" /></div>
            ) : orders.length === 0 ? (
              // Fallback empty orders state
              <div className="py-24 flex flex-col items-center gap-8 text-center bg-card border border-border/50">
                <Package size={48} strokeWidth={0.8} className="text-muted" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2">No orders yet.</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Your pieces are waiting to be curated.</p>
                </div>
                <Link href="/shop" className="btn-primary mt-4 inline-flex items-center gap-2">
                  Start Collecting <ArrowUpRight size={14} />
                </Link>
              </div>
            ) : (
              // Render list history items
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order._id} className="bg-card border border-border p-6 md:p-8 font-bold uppercase tracking-widest text-[9px] space-y-6">
                    {/* Item parameters header info */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-border/40 pb-4 gap-4">
                      <div className="space-y-1">
                        <span className="text-[8px] text-muted block">ORDER REFERENCE</span>
                        <span className="text-text font-black text-xs">{order._id.toUpperCase()}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 sm:gap-6">
                        <div className="space-y-1">
                          <span className="text-[8px] text-muted block flex items-center gap-1"><Calendar size={9} /> DATE</span>
                          <span className="text-text font-black text-[9px]">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] text-muted block">TOTAL AMOUNT</span>
                          <span className="text-terracotta font-black text-[10px]">₹{order.totalAmount.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] text-muted block">PAYMENT</span>
                          <span className={`px-2 py-0.5 border text-[8px] font-black tracking-widest ${
                            order.paymentStatus === 'Paid' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] text-muted block flex items-center gap-1"><Truck size={9} /> DELIVERY</span>
                          <span className="px-2 py-0.5 bg-accent/10 border border-accent/30 text-accent text-[8px] font-black">
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Purchased garments list */}
                    <div className="divide-y divide-border/20">
                      {order.items.map((item) => (
                        <div key={item._id} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-center">
                          <div className="w-10 h-12 bg-bg border border-border/30 shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-text font-black truncate text-[10px]">{item.name}</h4>
                            <p className="text-[8px] text-muted mt-0.5">SIZE: {item.size} · QTY: {item.quantity}</p>
                          </div>
                          <div className="text-text font-black text-[10px]">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

