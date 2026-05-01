"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    fullName: "", street: "", city: "", state: "", postalCode: "", country: "India", phone: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/checkout");
  }, [status, router]);

  const loadRazorpay = () => new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;
    setLoading(true);
    try {
      if (!await loadRazorpay()) throw new Error("Razorpay SDK failed to load.");
      const orderData = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, totalAmount: cartTotal, shippingAddress: address }),
      }).then((t) => t.json());
      if (orderData.error) throw new Error(orderData.error);
      const options = {
        key: orderData.keyId, amount: orderData.amount, currency: orderData.currency,
        name: "Calotes Vintage", description: "Archive Collection Purchase",
        order_id: orderData.razorpayOrderId,
        handler: async (response: any) => {
          const verify = await fetch("/api/orders/verify", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, order_id: orderData.orderId }),
          }).then((t) => t.json());
          if (verify.success) { clearCart(); router.push(`/checkout/success?order=${orderData.orderId}`); }
          else alert("Payment verification failed.");
        },
        prefill: { name: address.fullName, email: session?.user?.email || "", contact: address.phone },
        theme: { color: "#0F0F0F" },
      };
      new (window as any).Razorpay(options).open();
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddress({ ...address, [e.target.name]: e.target.value });

  if (status === "loading" || status === "unauthenticated") return (
    <div className="h-screen bg-bg flex items-center justify-center"><Loader2 className="animate-spin text-muted" /></div>
  );

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Header */}
      <div className="pt-28 pb-4 px-6 md:px-12 border-b border-border">
        <Link href="/shop" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted hover:text-text transition-colors">
          <ArrowLeft size={12} /> Back to Archive
        </Link>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-20">
        <h1 className="font-display font-black text-5xl md:text-7xl uppercase tracking-tighter mb-20">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* Form */}
          <div className="lg:col-span-7">
            <form id="checkout-form" onSubmit={handlePayment} className="space-y-16">
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-8">Contact</h2>
                <div className="space-y-4">
                  {[
                    { name: "fullName", placeholder: "Full Name" },
                    { name: "phone", placeholder: "Phone Number" }
                  ].map(f => (
                    <input key={f.name} required type="text" name={f.name} placeholder={f.placeholder}
                      value={(address as any)[f.name]} onChange={handleInputChange}
                      className="w-full bg-transparent border-b border-border py-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-text transition-colors placeholder:text-muted"
                    />
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-8">Shipping Address</h2>
                <div className="space-y-4">
                  {[
                    { name: "street", placeholder: "Street Address" },
                    { name: "city", placeholder: "City" },
                    { name: "state", placeholder: "State" },
                    { name: "postalCode", placeholder: "Postal Code" },
                  ].map(f => (
                    <input key={f.name} required type="text" name={f.name} placeholder={f.placeholder}
                      value={(address as any)[f.name]} onChange={handleInputChange}
                      className="w-full bg-transparent border-b border-border py-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-text transition-colors placeholder:text-muted"
                    />
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-8">Order Summary</h2>
              <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-4">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex gap-4 border-b border-border pb-6">
                    <div className="w-16 h-20 bg-card shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 py-1">
                      <h3 className="text-[10px] font-black uppercase tracking-wider line-clamp-1">{item.name}</h3>
                      <p className="text-[10px] text-muted font-bold uppercase mt-1">Size: {item.size} · Qty: {item.quantity}</p>
                      <p className="text-xs font-bold mt-2">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-6 space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-muted">Subtotal</span><span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-muted">Shipping</span><span>Calculated</span>
                </div>
                <div className="flex justify-between text-sm font-black uppercase tracking-widest border-t border-border pt-4">
                  <span>Total</span><span>₹{cartTotal}</span>
                </div>
              </div>
              <button type="submit" form="checkout-form" disabled={loading || !items.length}
                className="w-full bg-text text-bg py-6 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-bg-dark transition-colors disabled:opacity-40"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <><Lock size={14} /> Secure Payment</>}
              </button>
              <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted">
                <ShieldCheck size={12} /> Encrypted & Secure
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
