"use client"; // Marks this module as a client component to allow mounting of context providers

// Import NextAuth SessionProvider to propagate user login session states down the component tree
import { SessionProvider } from "next-auth/react";
// Import our custom CartProvider context wrapper
import { CartProvider } from "@/context/CartContext";
// Import our custom WishlistProvider context wrapper
import { WishlistProvider } from "@/context/WishlistContext";

// Root provider composition wrapper mounted in the top-level layout
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    // Inject NextAuth session context at the root level
    <SessionProvider>
      {/* Inject shopping cart state context */}
      <CartProvider>
        {/* Inject user wishlist state context inside the cart provider */}
        <WishlistProvider>{children}</WishlistProvider>
      </CartProvider>
    </SessionProvider>
  );
}

