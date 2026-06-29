"use client"; // Flags this file as a client component to support browser API scripts (Razorpay), user forms, and alerts

// Import React state and lifecycle hooks
import { useState, useEffect } from "react";
// Import cart drawer context providers
import { useCart } from "@/context/CartContext";
// Import NextAuth user hooks to track session logins
import { useSession } from "next-auth/react";
// Import Next.js routing hook
import { useRouter } from "next/navigation";
// Import vector icons
import { ArrowLeft, Lock, ShieldCheck, Loader2, Tag, Heart } from "lucide-react";
// Import Link for page transitions
import Link from "next/link";
// Import toast component alerts
import toast from "react-hot-toast";
// Import wishlist context manager hooks
import { useWishlist } from "@/context/WishlistContext";

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart(); // Extract cart state parameters
  const { data: session, status } = useSession(); // Access user profile session credentials
  const { toggleWishlist, isInWishlist } = useWishlist(); // Extract wishlist toggle controls
  const router = useRouter(); // Initialize page router redirects

  // UI state variables
  const [loading, setLoading] = useState(false); // Controls form submit progress spinners
  const [address, setAddress] = useState({
    fullName: "", street: "", city: "", state: "", postalCode: "", country: "India", phone: "",
  }); // Address fields binding

  // Discount states
  const [couponCode, setCouponCode] = useState("");      // User inputted code string
  const [discountAmount, setDiscountAmount] = useState(0); // Deducted monetary value
  const [appliedCoupon, setAppliedCoupon] = useState("");   // Checked, valid promo label
  const [validatingCoupon, setValidatingCoupon] = useState(false); // Tracks promo verification spinner

  // Redirect users to Login panel if session authentication checks fail
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/checkout"); // Append callback parameter to return after successful login
    }
  }, [status, router]);

  // Method dynamically appending the official Razorpay JS library script block to head
  const loadRazorpay = () => new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  // Query promo validate API endpoints to verify coupon eligibility
  const handleValidateCoupon = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal: cartTotal }),
      });
      const data = await res.json();

      if (res.ok) {
        setDiscountAmount(data.discountAmount); // Set discount amount state
        setAppliedCoupon(data.code); // Set verified coupon name
        toast.success(`Coupon "${data.code}" applied! Saved ₹${data.discountAmount.toLocaleString("en-IN")}`);
      } else {
        toast.error(data.error || "Failed to validate coupon");
      }
    } catch (err) {
      toast.error("Failed to apply discount coupon");
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Triggers order creation API routes and launches Razorpay checkout panel overlay
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;
    setLoading(true);
    try {
      // Dynamic loading Razorpay check
      if (!await loadRazorpay()) throw new Error("Razorpay SDK failed to load.");
      const finalAmount = cartTotal - discountAmount;
      
      // 1. Create order record on MongoDB and secure Razorpay order token ID
      const orderData = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, totalAmount: finalAmount, shippingAddress: address }),
      }).then((t) => t.json());
      if (orderData.error) throw new Error(orderData.error);
      
      // 2. Configure payment gateway parameters mapping Razorpay expectations
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Calotes Vintage",
        description: "Archive Collection Purchase",
        order_id: orderData.razorpayOrderId,
        // On successful payment collection: send transaction token to verification endpoints
        handler: async (response: any) => {
          const verify = await fetch("/api/orders/verify", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, order_id: orderData.orderId }),
          }).then((t) => t.json());
          if (verify.success) {
            clearCart(); // Flush item list
            router.push(`/checkout/success?order=${orderData.orderId}`); // Success redirect
          } else {
            alert("Payment verification failed.");
          }
        },
        prefill: { name: address.fullName },
        theme: { color: "#0F0F0F" },
        config: {
          display: {
            blocks: {
              banks: {
                name: 'All Payment Options',
                instruments: [
                  { method: 'upi' },
                  { method: 'card' },
                  { method: 'netbanking' },
                  { method: 'wallet' }
                ],
              },
            },
            sequence: ['block.banks'],
            preferences: { show_default_blocks: true },
          },
        },
      };
      // Instantiate and open standard gateway screen
      new (window as any).Razorpay(options).open();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Syncs typed address values to state hooks
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddress({ ...address, [e.target.name]: e.target.value });

  // Render blank spinner while NextAuth confirms user credentials session load
  if (status === "loading" || status === "unauthenticated") return (
    <div className="h-[70vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-terracotta" />
    </div>
  );

  return (
    <div className="w-full pt-32 pb-24 flex-1">
      {/* Back button Link header */}
      <div className="px-6 md:px-12 max-w-[1800px] mx-auto border-b border-border/40 py-10 mb-16">
        <Link href="/shop" className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted hover:text-text transition-all duration-300">
          <div className="w-8 h-px bg-muted group-hover:w-12 group-hover:bg-text transition-all duration-500" />
          <span>Back to Collection</span>
        </Link>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <h1 className="font-display font-black text-5xl md:text-7xl uppercase tracking-tighter mb-20 text-text">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Shipping Form block */}
          <div className="lg:col-span-7">
            <form id="checkout-form" onSubmit={handlePayment} className="space-y-16">
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-8 flex items-center gap-2">Contact</h2>
                <div className="space-y-4">
                  {[
                    { name: "fullName", placeholder: "Full Name" },
                    { name: "phone", placeholder: "Phone Number" }
                  ].map(f => (
                    <input key={f.name} required type="text" name={f.name} placeholder={f.placeholder}
                      value={(address as any)[f.name]} onChange={handleInputChange}
                      className="w-full bg-bg-warm border border-border p-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-terracotta transition-colors placeholder:text-muted/50 text-text"
                    />
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-8">Shipping Address</h2>
                <div className="space-y-4">
                  {[
                    { name: "street", placeholder: "Street Address" },
                    { name: "city", placeholder: "City" },
                    { name: "state", placeholder: "State" },
                    { name: "postalCode", placeholder: "Postal Code" },
                  ].map(f => (
                    <input key={f.name} required type="text" name={f.name} placeholder={f.placeholder}
                      value={(address as any)[f.name]} onChange={handleInputChange}
                      className="w-full bg-bg-warm border border-border p-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-terracotta transition-colors placeholder:text-muted/50 text-text"
                    />
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Checkout Summary panel */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 space-y-6 bg-bg-warm border border-border p-8">
              <h2 className="section-label mb-6">Order Summary</h2>
              {/* Product items scrolling layout list */}
              <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-4">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex gap-4 border-b border-border/50 pb-6 items-center">
                    <div className="w-16 h-20 bg-bg shrink-0 border border-border/30">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 py-1">
                      <h3 className="text-[10px] font-black uppercase tracking-wider line-clamp-1 text-text">{item.name}</h3>
                      <p className="text-[10px] text-muted font-bold uppercase mt-1">Size: {item.size} · Qty: {item.quantity}</p>
                      <p className="text-xs font-black mt-2 text-text">₹{item.price * item.quantity}</p>
                    </div>
                    {/* Add back to wishlist toggle options */}
                    <button
                      onClick={() => toggleWishlist({
                        productId: item.productId,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        slug: (item as any).slug || item.productId,
                        category: "Vintage",
                      })}
                      className="p-2 text-muted hover:text-terracotta transition-colors"
                      title={isInWishlist(item.productId) ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      <Heart size={18} className={isInWishlist(item.productId) ? "fill-current text-terracotta" : ""} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Promo code checking block */}
              <div className="border-t border-border/50 pt-6 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="ENTER COUPON CODE"
                    className="flex-1 bg-bg border border-border px-3 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-terracotta"
                    disabled={!!appliedCoupon}
                  />
                  <button
                    onClick={handleValidateCoupon}
                    disabled={validatingCoupon || !!appliedCoupon}
                    className="bg-text text-bg border border-text px-4 py-2 text-[9px] font-black uppercase tracking-widest hover:bg-bg hover:text-text transition-colors disabled:opacity-50"
                  >
                    {validatingCoupon ? "CHECKING..." : "APPLY"}
                  </button>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between items-center mt-2 text-[9px] font-black uppercase tracking-widest text-accent">
                    <span className="flex items-center gap-1">
                      <Tag size={10} /> Coupon Applied: {appliedCoupon}
                    </span>
                    <button
                      onClick={() => {
                        setAppliedCoupon("");
                        setDiscountAmount(0);
                        setCouponCode("");
                      }}
                      className="text-muted hover:text-text lowercase font-semibold tracking-normal underline"
                    >
                      remove
                    </button>
                  </div>
                )}
              </div>

              {/* Cost breakdown list */}
              <div className="border-t border-border pt-6 space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-text">
                  <span className="text-muted">Subtotal</span><span>₹{cartTotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-accent">
                    <span>Discount</span><span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-text">
                  <span className="text-muted">Shipping</span><span>Calculated</span>
                </div>
                <div className="flex justify-between text-sm font-black uppercase tracking-widest border-t border-border pt-4 text-text">
                  <span>Total</span><span className="text-terracotta">₹{(cartTotal - discountAmount).toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-6 space-y-4">
                <button type="submit" form="checkout-form" disabled={loading || !items.length}
                  className="btn-primary w-full justify-center py-5 flex items-center gap-3 disabled:opacity-40"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <><Lock size={13} /> Secure Payment</>}
                </button>
                {/* Save complete order list to wishlist */}
                <button
                  type="button"
                  onClick={() => {
                    items.forEach((item) =>
                      toggleWishlist({
                        productId: item.productId,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        slug: (item as any).slug || item.productId,
                        category: "Vintage",
                      })
                    );
                    toast.success("All items added to wishlist");
                  }}
                  className="btn-outline w-full justify-center py-4 flex items-center gap-2"
                >
                  <Heart size={16} className="text-terracotta" /> Save Order to Wishlist
                </button>
              </div>
              <div className="flex items-center justify-center gap-2 section-label mt-2">
                <ShieldCheck size={11} className="text-terracotta" /> Encrypted &amp; Secure
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

