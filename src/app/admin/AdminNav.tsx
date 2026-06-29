'use client'; // Flags this component for client rendering to fetch path configurations in real time

// Import Link transitions
import Link from "next/link";
// Import hook to fetch current browser path configurations
import { usePathname } from "next/navigation";
// Import UI vector icons
import { LayoutDashboard, ShoppingBag, FolderOpen, Tag, Package, Users, Settings } from "lucide-react";

export default function AdminNav() {
  const pathname = usePathname(); // Track active path names

  // List of administrative links mappings
  const navItems = [
    { name: "Dashboard", href: "/admin", icon: <LayoutDashboard size={18} /> },
    { name: "Products", href: "/admin/products", icon: <ShoppingBag size={18} /> },
    { name: "Categories", href: "/admin/categories", icon: <FolderOpen size={18} /> },
    { name: "Promo Codes", href: "/admin/promo", icon: <Tag size={18} /> },
    { name: "Orders", href: "/admin/orders", icon: <Package size={18} /> },
    { name: "Customers", href: "/admin/customers", icon: <Users size={18} /> },
    { name: "Settings", href: "/admin/settings", icon: <Settings size={18} /> },
  ];

  return (
    <nav className="flex-1 p-4 space-y-2">
      {navItems.map((item) => {
        // Detect if link is active by checking exact match, or checking if sub-route links match prefix urls
        const isActive = 
          pathname === item.href || 
          (item.href !== "/admin" && pathname.startsWith(item.href));
        
        return (
          <Link 
            key={item.name} 
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-200 border ${
              isActive 
                ? "bg-text text-bg border-text translate-x-1" // Highlight active routes
                : "text-muted hover:bg-bg hover:text-text border-transparent"
            }`}
          >
            {item.icon} 
            <span className="flex-1">{item.name}</span>
            {/* Draw dynamic accent circle next to active page links */}
            {isActive && <div className="w-1.5 h-1.5 bg-accent rounded-full" />}
          </Link>
        );
      })}
    </nav>
  );
}

