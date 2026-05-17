"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Loader2, Package, Truck, Phone, Tag } from "lucide-react";
import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
  _id: string;
}

interface OrderDetails {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        console.error("Failed to load order details for success screen", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  return (
    <div className="w-full flex-1 flex flex-col items-center py-32 px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-12 max-w-2xl w-full text-center"
      >
        {/* Checked Badge */}
        <div className="w-20 h-20 border border-accent flex items-center justify-center mx-auto bg-card">
          <CheckCircle2 size={40} strokeWidth={0.8} className="text-accent animate-pulse" />
        </div>

        {/* Title */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-4">Order Confirmed</p>
          <h1 className="font-display font-black text-5xl md:text-7xl uppercase tracking-tighter leading-[0.9]">
            Thank You<br />for Shopping <br />
            <span className="text-outline italic" style={{ WebkitTextStroke: '1px var(--color-text)' }}>the Archive.</span>
          </h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-8 text-xs font-black uppercase tracking-widest text-muted gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
            Fetching Order Details...
          </div>
        ) : order ? (
          /* Order Details Card */
          <div className="bg-card border border-border text-left p-6 md:p-8 space-y-8 font-bold uppercase tracking-widest text-[10px]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-border/50 pb-4 gap-2">
              <div>
                <span className="text-muted block text-[9px] mb-1">ORDER ID</span>
                <span className="text-text font-black text-sm">{order._id.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-muted block text-[9px] mb-1">STATUS</span>
                <span className="px-2 py-1 bg-accent/15 border border-accent text-accent font-black text-[9px]">
                  {order.paymentStatus === 'Paid' ? 'PAID & PROCESSING' : 'PENDING'}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-4">
              <span className="text-muted block text-[9px]">YOUR GARMENTS</span>
              <div className="divide-y divide-border/30">
                {order.items.map((item) => (
                  <div key={item._id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="w-12 h-16 bg-bg border border-border/30 shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-text font-black truncate text-xs">{item.name}</h4>
                      <p className="text-[9px] text-muted mt-1">SIZE: {item.size} · QTY: {item.quantity}</p>
                    </div>
                    <div className="text-text font-black text-xs self-center">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery address */}
            <div className="border-t border-border/50 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 text-[9px]">
              <div className="space-y-2">
                <span className="text-muted block flex items-center gap-1">
                  <Truck size={10} className="text-accent" /> SHIPPING ADDRESS
                </span>
                <p className="text-text leading-relaxed font-bold">
                  {order.shippingAddress.fullName}<br />
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}<br />
                  {order.shippingAddress.country}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-muted block flex items-center gap-1">
                  <Phone size={10} className="text-accent" /> CONTACT INFO
                </span>
                <p className="text-text font-bold flex items-center gap-2">
                  {order.shippingAddress.phone || "No phone listed"}
                </p>
                <div className="pt-2">
                  <span className="text-muted block">TOTAL CHARGED</span>
                  <span className="text-terracotta text-sm font-black mt-1 block">
                    ₹{order.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          orderId && (
            <div className="border-y border-border py-6 bg-card">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">
                Order Reference: <span className="text-text ml-2">{orderId.slice(-8).toUpperCase()}</span>
              </p>
            </div>
          )
        )}

        <p className="text-xs font-bold uppercase tracking-widest text-muted max-w-sm mx-auto">
          We are preparing your garments. A confirmation email has been sent.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Link href="/shop" className="awwwards-btn inline-flex items-center gap-2">
            Back to Shop
          </Link>
          <Link href="/profile" className="awwwards-btn-accent inline-flex items-center gap-2">
            View Purchases <ArrowRight size={14} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="h-[70vh] flex items-center justify-center" />}>
      <SuccessContent />
    </Suspense>
  );
}
