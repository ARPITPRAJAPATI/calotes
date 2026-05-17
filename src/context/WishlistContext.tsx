"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  category?: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (item: WishlistItem) => void;
  clearWishlist: () => void;
  count: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);
const STORAGE_KEY = "calotes_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const isInWishlist = useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items]
  );

  const toggleWishlist = useCallback((item: WishlistItem) => {
    const exists = items.find((i) => i.productId === item.productId);
    if (exists) {
      toast("Removed from wishlist", { icon: "💔" });
      setItems((prev) => prev.filter((i) => i.productId !== item.productId));
    } else {
      toast.success("Added to wishlist ♥");
      setItems((prev) => [...prev, item]);
    }
  }, [items]);

  const clearWishlist = useCallback(() => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
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

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
