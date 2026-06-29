"use client"; // Flags this file as client-side component code to support browser state hooks and localStorage

// Import React hooks for creating contexts, lifecycle effects, callback memoization, and reading inputs
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
// Import hot-toast notifications for elegant, high-fidelity overlay alerts
import toast from "react-hot-toast";

// Structure definition of a saved wishlist item
export interface WishlistItem {
  productId: string; // MongoDB Product identifier
  name: string;      // Product title
  price: number;     // Active currency price in INR
  image: string;     // Thumbnail image URL
  slug: string;      // Unique slug for path linking
  category?: string; // category tag label string
}

// Interface detailing exposed wishlist context properties and action callbacks
interface WishlistContextType {
  items: WishlistItem[]; // List of items saved in the wishlist
  isInWishlist: (productId: string) => boolean; // Helper checking if an item is already saved
  toggleWishlist: (item: WishlistItem) => void; // Main action toggling item presence (add/remove)
  clearWishlist: () => void; // Reset wishlist array to empty
  count: number;             // Count tracking size of wishlist
  isOpen: boolean;           // State tracking if the slide-out wishlist drawer is open
  setIsOpen: (open: boolean) => void; // Action toggle wishlist drawer open/close
}

// Create the Context with null fallback value
const WishlistContext = createContext<WishlistContextType | null>(null);
// LocalStorage key constant for consistent namespace reads/writes
const STORAGE_KEY = "calotes_wishlist";

// Provider wrapper component housing the wishlist state manager
export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]); // Initialize state array for wishlist items
  const [isOpen, setIsOpen] = useState(false); // Track drawer visibility state (defaults to closed)

  // Run on mount to hydrate wishlist state from browser's localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY); // Retrieve stringified data
      if (stored) {
        const parsed = JSON.parse(stored); // Parse back into array
        requestAnimationFrame(() => {
          setItems(parsed); // Hydrate state after initial page paint
        });
      }
    } catch {}
  }, []);

  // Run whenever items state updates to sync changes back to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); // Write stringified array
    } catch {}
  }, [items]);

  // Evaluator function returning boolean value checking if an item exists in wishlist
  // Wrapped in useCallback to prevent child components re-rendering on parent updates
  const isInWishlist = useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items]
  );

  // Main action callback that adds or removes an item based on current saved status
  const toggleWishlist = useCallback((item: WishlistItem) => {
    // Search for existing item with matching ID
    const exists = items.find((i) => i.productId === item.productId);
    if (exists) {
      // If item is already saved, trigger removal toast and filter out the item
      toast("Removed from wishlist", { icon: "💔" });
      setItems((prev) => prev.filter((i) => i.productId !== item.productId));
    } else {
      // If item is not saved, trigger success toast and append item details to saved list
      toast.success("Added to wishlist ♥");
      setItems((prev) => [...prev, item]);
    }
  }, [items]);

  // Action method to wipe all saved wishlist items
  const clearWishlist = useCallback(() => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    // Wrap child components inside the Provider, mapping active state and callback functions
    <WishlistContext.Provider
      value={{
        items,
        isInWishlist,
        toggleWishlist,
        clearWishlist,
        count: items.length,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

// Custom hook helper for convenient context retrieval across child UI modules
export function useWishlist() {
  const ctx = useContext(WishlistContext);
  // Throw diagnostic runtime error if useWishlist is invoked outside of the parent context provider tree
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx; // Return context value reference
}

