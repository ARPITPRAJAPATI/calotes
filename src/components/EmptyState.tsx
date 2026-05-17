import { Search, ShoppingBag, Heart, PackageX } from 'lucide-react';
import Link from 'next/link';

type EmptyStateType = 'cart' | 'orders' | 'wishlist' | 'search';

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  actionText?: string;
  actionLink?: string;
}

export default function EmptyState({ 
  type, 
  title, 
  description, 
  actionText = "Continue Shopping",
  actionLink = "/shop"
}: EmptyStateProps) {
  const icons = {
    cart: ShoppingBag,
    orders: PackageX,
    wishlist: Heart,
    search: Search
  };

  const Icon = icons[type];

  const defaultTitles = {
    cart: "Your Bag is Empty",
    orders: "No Orders Yet",
    wishlist: "Your Wishlist is Empty",
    search: "No Results Found"
  };

  const defaultDescriptions = {
    cart: "Looks like you haven't added any vintage pieces to your bag yet.",
    orders: "You haven't placed any orders with us yet.",
    wishlist: "Save your favorite pieces here to find them later.",
    search: "We couldn't find any pieces matching your search. Try adjusting your filters."
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Icon size={32} className="text-gray-400" />
      </div>
      <h3 className="text-2xl font-playfair font-bold mb-2 uppercase">
        {title || defaultTitles[type]}
      </h3>
      <p className="text-muted max-w-md mb-8">
        {description || defaultDescriptions[type]}
      </p>
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
