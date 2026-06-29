'use client'; // Flags this file as a client component to support browser state hooks, toast alerts, table clicks, and fetches

// Import React state and lifecycle hooks
import { useState, useEffect } from 'react';
// Import link tags
import Link from 'next/link';
// Import UI vector icon components
import { Plus, Trash2, Edit, ExternalLink, Search, Loader2 } from 'lucide-react';
// Import hot toast notification helper
import toast from 'react-hot-toast';
// Import Product struct types definitions
import { Product } from '@/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]); // Holds entire catalog list
  const [searchTerm, setSearchTerm] = useState('');       // Binds text search input
  const [isLoading, setIsLoading] = useState(true);        // Spinner loader controller

  // Query catalog API endpoint to retrieve all archive products sorted newest first
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?sort=-createdAt');
      const data = await res.json();
      if (res.ok) {
        setProducts(data); // Hydrate local state
      } else {
        toast.error('Failed to load products');
      }
    } catch {
      toast.error('Error fetching catalog');
    } finally {
      setIsLoading(false); // Disable spinner
    }
  };

  // Run catalog retrieval operations on component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  // DELETE request handler: triggers a product deletion API call
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this archive piece?')) return; // Guard confirm modal

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Piece deleted from catalog');
        // Filter out deleted product record from state list in-place to update UI immediately
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } else {
        toast.error('Failed to delete piece');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  // Compute in-memory list filtering based on search terms matching product names
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* HUD Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-border pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-display font-black uppercase tracking-tighter">
            Product Catalog
          </h1>
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">
            Manage your vintage pieces and archive collection
          </p>
        </div>
        <Link
          href="/admin/products/new" // Create new product routing link
          className="bg-text text-bg px-4 py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-bg-dark transition-colors shrink-0"
        >
          <Plus size={14} /> Catalog New Piece
        </Link>
      </div>

      {/* Search Input bar */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted">
          <Search size={16} />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search pieces by name..."
          className="w-full bg-card border border-border pl-10 pr-4 py-3 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-text transition-colors"
        />
      </div>

      {/* Table grid listing elements */}
      <div className="bg-card border border-border overflow-hidden">
        {isLoading ? (
          // Spinner Loader view
          <div className="p-16 flex flex-col items-center justify-center text-xs font-black uppercase tracking-widest text-text gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-terracotta" />
            <span>Loading Catalog Archives...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-bg text-[10px] font-black uppercase tracking-widest text-muted border-b border-border">
                <tr>
                  <th className="p-4 w-16">Image</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Condition</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-bold uppercase tracking-widest text-xs">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-bg/50 transition-colors">
                    <td className="p-4">
                      {/* Image Thumbnail wrapper */}
                      <div className="w-12 h-16 bg-white border border-border overflow-hidden">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-muted">
                            NO IMG
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="line-clamp-2 max-w-xs">{product.name}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-muted">
                        {product.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="p-4">₹{product.price}</td>
                    <td className="p-4">
                      <span className="text-terracotta">{product.condition}</span>
                    </td>
                    <td className="p-4">
                      <span className={product.stock === 0 ? 'text-accent-red' : ''}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {/* Edit, Delete, View buttons layout bar */}
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/shop/product/${product.slug}`}
                          className="text-[9px] text-muted hover:text-text flex items-center gap-1 transition-colors"
                          target="_blank"
                        >
                          <ExternalLink size={10} /> View
                        </Link>
                        <span className="text-border">|</span>
                        <Link
                          href={`/admin/products/${product._id}/edit`} // Directs to editing panel
                          className="text-[9px] text-muted hover:text-text flex items-center gap-1 transition-colors"
                        >
                          <Edit size={10} /> Edit
                        </Link>
                        <span className="text-border">|</span>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-[9px] text-muted hover:text-accent-red flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 size={10} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  // Empty state fallbacks
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-muted">
                      No archive pieces found matching that description.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

