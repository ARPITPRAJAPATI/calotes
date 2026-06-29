"use client"; // Flags this file as client component execution context (uses state, hooks, and context state)

// Import the useCart custom hook to access cart items list and edit callbacks
import { useCart } from "@/context/CartContext";
// Import Framer Motion for slide transitions and overlay backdrop animations
import { motion, AnimatePresence } from "framer-motion";
// Import Lucide React UI icon elements
import { X, Plus, Minus, ArrowRight } from "lucide-react";
// Import Link for client navigation mapping
import Link from "next/link";
// Import useRouter to control direct programmatic redirection actions
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  // Extract state properties and callback actions from useCart context hook
  const { isCartOpen, setIsCartOpen, items, removeFromCart, updateQuantity, cartTotal } = useCart();
  const router = useRouter(); // Initialize router instance

  return (
    // Listen to visibility states to run mount/unmount animations
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* ── Backdrop Overlay Shadow (dims background page content) ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)} // Close the cart drawer if the user clicks outside on the dimmed backdrop
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
          />
          
          {/* ── Sliding Panel (contains cart contents) ── */}
          <motion.div
            initial={{ x: "100%" }} // Slide in from off-screen right
            animate={{ x: 0 }}       // Move to final resting coordinate
            exit={{ x: "100%" }}    // Slide back off-screen on close
            // Configure spring transition options for premium snap feel
            transition={{ type: "spring", damping: 30, stiffness: 220 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-bg-warm border-l border-border-warm z-[101] flex flex-col"
          >
            {/* Header section containing drawer title and close trigger button */}
            <div className="p-8 border-b border-border flex justify-between items-center">
              <h2 className="text-sm font-black uppercase tracking-[0.2em]">
                Your Collection {items.length > 0 && `[${items.length}]`}
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="text-muted hover:text-text transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Middle scrollable item listing layout container */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {items.length === 0 ? (
                // Render fallback when cart list contains zero elements
                <div className="h-full flex flex-col items-center justify-center gap-6 text-center">
                  <p className="text-muted text-xs uppercase tracking-[0.2em] font-bold">Your archive is empty.</p>
                  <button onClick={() => setIsCartOpen(false)} className="btn-outline">
                    Browse Collection
                  </button>
                </div>
              ) : (
                // Map over array list of cart items
                items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex gap-6 border-b border-border pb-8">
                    {/* Item Thumbnail Frame */}
                    <div className="w-20 h-28 bg-card shrink-0 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    {/* Item Text Metadata & Count Adjustment triggers */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="text-[10px] font-black uppercase tracking-wider leading-snug">{item.name}</h3>
                          <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">Size: {item.size}</p>
                        </div>
                        {/* Remove item trigger button */}
                        <button onClick={() => removeFromCart(item.productId, item.size)} className="text-muted hover:text-text transition-colors shrink-0 mt-0.5">
                          <X size={14} />
                        </button>
                      </div>
                      
                      {/* Quantity adjusting selector controls */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center border border-border">
                          {/* Decrement quantity */}
                          <button onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)} className="p-2 hover:bg-card transition-colors"><Minus size={12} /></button>
                          <span className="text-[10px] font-bold w-8 text-center">{item.quantity}</span>
                          {/* Increment quantity */}
                          <button onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)} className="p-2 hover:bg-card transition-colors"><Plus size={12} /></button>
                        </div>
                        {/* Row item cost (price multiplied by quantity) */}
                        <span className="text-xs font-bold">₹{item.price * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom summary and navigation trigger section (rendered if items exist) */}
            {items.length > 0 && (
              <div className="p-8 border-t border-border space-y-6">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                  <span>Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-center pt-4">
                  {/* Redirect user to checkout route */}
                  <button
                    onClick={() => { setIsCartOpen(false); router.push("/checkout"); }}
                    className="btn-primary w-full justify-center py-4 flex items-center gap-3"
                  >
                    Checkout <ArrowRight size={14} />
                  </button>
                </div>
                <p className="text-[10px] text-center text-muted font-bold uppercase tracking-widest">
                  Shipping calculated at checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

