"use client"; // Marks this component as client-side code running inside browser UI runtime

// Import Framer Motion for premium slide drawer animations
import { motion, AnimatePresence } from "framer-motion";
// Import Link for page transitions
import Link from "next/link";
// Import Image from Next.js for optimized performance image lazy loading
import Image from "next/image";
// Import Lucide icons
import { X, Heart, ShoppingBag, Trash2, Sparkles } from "lucide-react";
// Import custom state context hook managers
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export default function WishlistDrawer() {
  // Extract state properties and callbacks from custom wishlist hook
  const { items, isOpen, setIsOpen, toggleWishlist, clearWishlist } = useWishlist();
  // Extract cart insert callback and drawer visibility toggle actions from Cart context
  const { addToCart, setIsCartOpen } = useCart();

  // Helper action to insert a saved wishlist item into shopping cart drawer, clearing it from wishlist
  const handleMoveToCart = (item: typeof items[0]) => {
    addToCart({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      size: "OS",        // Default size designation for moved items is One Size
      quantity: 1,       // Default size quantities is 1
    });
    toggleWishlist(item); // Remove the item from wishlist state array
    setIsOpen(false);     // Close wishlist drawer panel
    setIsCartOpen(true);  // Instantly slide open cart drawer for feedback
  };

  return (
    // AnimatePresence listens to exit transitions before nodes unmount
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop Overlay Shadow ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)} // Close wishlist panel if clicked outside
            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
          />

          {/* ── Sliding Panel (contains saved wishlist archive) ── */}
          <motion.div
            initial={{ x: "100%" }} // Off-screen right
            animate={{ x: 0 }}       // Move to target resting coordinates
            exit={{ x: "100%" }}    // Slide back on close
            transition={{ type: "spring", damping: 32, stiffness: 300 }} // Config spring stiffness
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] z-[95] bg-bg flex flex-col border-l border-border shadow-2xl"
          >
            {/* Header section containing drawer title and count text */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-border shrink-0">
              <div>
                <h2 className="font-display font-black text-2xl uppercase tracking-tighter flex items-center gap-2">
                  <Heart size={18} className="text-terracotta" fill="currentColor" />
                  Wishlist
                </h2>
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted mt-1">
                  {items.length} {items.length === 1 ? "piece" : "pieces"} saved
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-muted hover:text-text transition-colors"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Scrollable list containing saved items */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              {items.length === 0 ? (
                // Fallback layout when wishlist contains zero elements
                <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
                  <Heart size={48} className="text-border opacity-40" />
                  <div>
                    <p className="font-display font-black text-2xl uppercase tracking-tighter opacity-30">
                      Empty Archive
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted mt-2 opacity-60">
                      Save pieces you love to style later
                    </p>
                  </div>
                  <Link
                    href="/shop"
                    onClick={() => setIsOpen(false)}
                    className="btn-primary"
                  >
                    Explore The Vault
                  </Link>
                </div>
              ) : (
                // Map over wishlist items
                items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-4 group border border-border p-3 hover:border-terracotta transition-colors"
                  >
                    {/* Item Thumbnail */}
                    <Link
                      href={`/shop/product/${item.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="w-20 h-24 bg-bg-warm shrink-0 overflow-hidden border border-border/50 relative"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover hover:scale-105 transition-transform duration-700"
                      />
                    </Link>

                    {/* Item title details and add to cart/delete action buttons */}
                    <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                      <div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest line-clamp-2 leading-tight">
                          {item.name}
                        </h3>
                        {item.category && (
                          <p className="text-[8px] font-bold text-muted uppercase tracking-widest mt-0.5">
                            {item.category}
                          </p>
                        )}
                        <p className="text-[12px] font-black text-terracotta mt-1">
                          ₹{item.price.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        {/* Insert into cart drawer callback trigger */}
                        <button
                          onClick={() => handleMoveToCart(item)}
                          className="flex-1 text-[8px] font-black uppercase tracking-[0.2em] bg-text text-bg py-2 px-2 hover:bg-terracotta transition-colors flex items-center justify-center gap-1.5"
                        >
                          <ShoppingBag size={10} /> Add to Bag
                        </button>
                        {/* Delete item from saved wishlist list */}
                        <button
                          onClick={() => toggleWishlist(item)}
                          className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors border border-border"
                          title="Remove"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom action trigger bar (shown if items list is populated) */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-border bg-bg-warm shrink-0 space-y-3">
                {/* Redirect user to Fit Studio Canvas styling workspace */}
                <Link
                  href="/canvas"
                  onClick={() => setIsOpen(false)}
                  className="btn-primary w-full justify-center py-4 flex items-center gap-2"
                >
                  <Sparkles size={14} /> Style in Fit Canvas
                </Link>
                {/* Clear all saved items button */}
                <button
                  onClick={clearWishlist}
                  className="w-full text-[9px] font-bold uppercase tracking-widest text-muted hover:text-text transition-colors py-2"
                >
                  Clear Wishlist
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

