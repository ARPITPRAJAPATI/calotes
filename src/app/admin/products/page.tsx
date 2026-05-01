import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AdminProductsPage() {
  await connectDB();
  
  // Fetch products
  const products = await Product.find().populate('category', 'name').sort('-createdAt');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-border pb-4">
        <h1 className="text-3xl font-display font-black uppercase tracking-tighter">
          Product Catalog
        </h1>
        <button className="bg-text text-bg px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-bg-dark transition-colors">
          <Plus size={14} /> Add Product
        </button>
      </div>

      <div className="bg-card border border-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-bg text-[10px] font-black uppercase tracking-widest text-muted border-b border-border">
            <tr>
              <th className="p-4 w-16">Image</th>
              <th className="p-4">Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Condition</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-bold uppercase tracking-widest text-xs">
            {products.map((product) => (
              <tr key={product._id.toString()} className="hover:bg-bg/50 transition-colors">
                <td className="p-4">
                  <div className="w-12 h-16 bg-white border border-border">
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="p-4 line-clamp-2 max-w-xs pt-6">{product.name}</td>
                <td className="p-4">{(product.category as any)?.name}</td>
                <td className="p-4">₹{product.price}</td>
                <td className="p-4 text-accent-red">{product.condition}</td>
                <td className="p-4 text-right">
                  <Link href={`/shop/product/${product.slug}`} className="text-[10px] text-muted hover:text-text transition-colors" target="_blank">
                    View
                  </Link>
                  <span className="mx-2 text-border">|</span>
                  <button className="text-[10px] text-muted hover:text-text transition-colors">Edit</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
