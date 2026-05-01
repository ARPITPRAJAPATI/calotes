"use client";

import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, removeFromCart, updateQuantity, cartTotal } = useCart();
  const router = useRouter();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 220 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-bg z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-border flex justify-between items-center">
              <h2 className="text-sm font-black uppercase tracking-[0.2em]">
                Your Collection {items.length > 0 && `[${items.length}]`}
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="text-muted hover:text-text transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-6 text-center">
                  <p className="text-muted text-xs uppercase tracking-[0.2em] font-bold">Your archive is empty.</p>
                  <button onClick={() => setIsCartOpen(false)} className="awwwards-btn">
                    Browse Collection
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex gap-6 border-b border-border pb-8">
                    <div className="w-20 h-28 bg-card shrink-0 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="text-[10px] font-black uppercase tracking-wider leading-snug">{item.name}</h3>
                          <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">Size: {item.size}</p>
                        </div>
                        <button onClick={() => removeFromCart(item.productId, item.size)} className="text-muted hover:text-text transition-colors shrink-0 mt-0.5">
                          <X size={14} />
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center border border-border">
                          <button onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)} className="p-2 hover:bg-card transition-colors"><Minus size={12} /></button>
                          <span className="text-[10px] font-bold w-8 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)} className="p-2 hover:bg-card transition-colors"><Plus size={12} /></button>
                        </div>
                        <span className="text-xs font-bold">₹{item.price * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-8 border-t border-border space-y-6">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                  <span>Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>
                <button
                  onClick={() => { setIsCartOpen(false); router.push("/checkout"); }}
                  className="w-full bg-text text-bg py-5 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-bg-dark transition-colors"
                >
                  Checkout <ArrowRight size={14} />
                </button>
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
