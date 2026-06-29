"use client"; // Marks this context provider as a client component to access React state and localStorage hooks

// Import React hooks for context definition, component state, and side effect lifecycle hooks
import React, { createContext, useContext, useState, useEffect } from "react";

// Structure definition of an individual product item stored in the shopping cart
export interface CartItem {
  productId: string; // MongoDB Product ID
  name: string;      // Product name
  price: number;     // Active price
  image: string;     // Thumbnail image URL
  size: string;      // User-selected size string (e.g. S, M, L, OS)
  quantity: number;  // Current quantity of this specific size
}

// Interface outlining the values and action methods exposed by the CartContext
interface CartContextType {
  items: CartItem[]; // List of items currently in the cart
  addToCart: (item: CartItem) => void; // Function to add a new item
  removeFromCart: (productId: string, size: string) => void; // Function to delete an item by ID and size match
  updateQuantity: (productId: string, size: string, quantity: number) => void; // Adjust quantity of a specific item
  clearCart: () => void; // Reset cart items array to empty
  isCartOpen: boolean;  // State tracking if the slide-out cart drawer is visible
  setIsCartOpen: (isOpen: boolean) => void; // Action toggle cart drawer visibility
  cartTotal: number;    // Computed total subtotal cost of all cart items
  cartCount: number;    // Computed count of all item quantities in cart
}

// Create the Context object with undefined fallback default
const CartContext = createContext<CartContextType | undefined>(undefined);

// Context Provider wrapper component containing the state management logic
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]); // Initialize state array for cart items
  const [isCartOpen, setIsCartOpen] = useState(false); // Initialize cart drawer open state as closed
  const [isMounted, setIsMounted] = useState(false);   // Mount flag tracking to prevent React 18 hydration mismatches

  // Run on mount to hydrate cart items state from browser's localStorage
  useEffect(() => {
    // requestAnimationFrame ensures state writes execute after initial browser painting
    requestAnimationFrame(() => {
      setIsMounted(true); // Flag component as mounted on the client
    });
    
    const savedCart = localStorage.getItem("calotes_cart"); // Retrieve stringified cart data
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart); // Parse string back into array
        requestAnimationFrame(() => {
          setItems(parsed); // Hydrate state
        });
      } catch (e) {
        console.error("Failed to parse cart", e); // Print error if JSON syntax parsing fails
      }
    }
  }, []);

  // Run whenever the items state or isMounted flag updates to persist cart state to localStorage
  useEffect(() => {
    // Only perform write operations if the component has successfully completed its mount phase
    if (isMounted) {
      localStorage.setItem("calotes_cart", JSON.stringify(items));
    }
  }, [items, isMounted]);

  // Action method to append a new item or increment its count if it already exists
  const addToCart = (newItem: CartItem) => {
    setItems((prev) => {
      // Look for an existing item in the cart matching both the Product ID and selected Size
      const existingItem = prev.find(
        (item) => item.productId === newItem.productId && item.size === newItem.size
      );
      // If a matching item is found
      if (existingItem) {
        // Map over previous items and increment the matching item's quantity
        return prev.map((item) =>
          item.productId === newItem.productId && item.size === newItem.size
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      // If the item does not exist in the cart, append the new item payload to the array
      return [...prev, newItem];
    });
    setIsCartOpen(true); // Automatically slide open the cart drawer for a premium feedback experience
  };

  // Action method to remove a product item from the cart matching both ID and size constraints
  const removeFromCart = (productId: string, size: string) => {
    setItems((prev) =>
      // Filter out only the item matching BOTH criteria
      prev.filter((item) => !(item.productId === productId && item.size === size))
    );
  };

  // Action method to update the quantity value of a specific item-size combo
  const updateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity < 1) return; // Prevent setting quantities below 1 (user must use remove action instead)
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Reset the cart item array to empty state (used post-checkout success)
  const clearCart = () => {
    setItems([]);
  };

  // Compute the total cost of all cart items dynamically
  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  
  // Compute the total aggregate count of items in the cart
  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    // Wrap child components inside the Provider context, passing down state values and actions
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook helper enabling easy access to CartContext from child functional components
export function useCart() {
  const context = useContext(CartContext);
  // Throw an error if a developer attempts to call useCart outside of a CartProvider tree node
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context; // Return context state reference
}

