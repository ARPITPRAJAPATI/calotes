// Import standard vectors from lucide icon library
import { Search, ShoppingBag, Heart, PackageX } from 'lucide-react';
// Import Link component
import Link from 'next/link';

// Union type tracking available template empty states
type EmptyStateType = 'cart' | 'orders' | 'wishlist' | 'search';

// Interface mapping customizable parameter items
interface EmptyStateProps {
  type: EmptyStateType;   // Type identifier selector
  title?: string;          // Optional override title text
  description?: string;    // Optional override description text
  actionText?: string;     // Optional override navigation link text label
  actionLink?: string;     // Target link route path destination
}

export default function EmptyState({ 
  type, 
  title, 
  description, 
  actionText = "Continue Shopping", // Default link label setting
  actionLink = "/shop"              // Default route target redirect
}: EmptyStateProps) {
  // Dictionary mapping specific icons to matching empty states
  const icons = {
    cart: ShoppingBag,
    orders: PackageX,
    wishlist: Heart,
    search: Search
  };

  const Icon = icons[type]; // Extract active icon vector matching type parameter

  // Dictionary mapping default heading text payloads
  const defaultTitles = {
    cart: "Your Bag is Empty",
    orders: "No Orders Yet",
    wishlist: "Your Wishlist is Empty",
    search: "No Results Found"
  };

  // Dictionary mapping default detailed explanations
  const defaultDescriptions = {
    cart: "Looks like you haven't added any vintage pieces to your bag yet.",
    orders: "You haven't placed any orders with us yet.",
    wishlist: "Save your favorite pieces here to find them later.",
    search: "We couldn't find any pieces matching your search. Try adjusting your filters."
  };

  return (
    // Visual layout block centering content items
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Icon boundary container circle */}
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Icon size={32} className="text-gray-400" />
      </div>
      {/* Dynamic heading text */}
      <h3 className="text-2xl font-playfair font-bold mb-2 uppercase">
        {title || defaultTitles[type]}
      </h3>
      {/* Dynamic details paragraph */}
      <p className="text-muted max-w-md mb-8">
        {description || defaultDescriptions[type]}
      </p>
      {/* Conditionally display navigation button if empty state is not a search failure result */}
      {type !== 'search' && (
        <Link 
          href={actionLink}
          className="bg-text text-bg px-8 py-3 font-bold uppercase tracking-wider text-sm hover:bg-terracotta transition-colors"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}

