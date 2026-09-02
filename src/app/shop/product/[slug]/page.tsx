import connectDB from "@/lib/db";
import Product from "@/models/Product";
import ProductClient from "@/components/ProductClient";
import { notFound } from "next/navigation";
import { isValidObjectId } from "@/lib/sanitize";

// ISR: 1-hour Edge CDN cache — on-demand revalidation fires instantly when admin
// edits or deletes a product, keeping the page always fresh without background CPU burn.
export const revalidate = 3600;

// Pre-render top 30 active products at build time for instant 0ms edge delivery
export async function generateStaticParams() {
  try {
    await connectDB();
    const products = await Product.find({ stock: { $gt: 0 } })
      .select('slug _id')
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(30)
      .lean();

    return products.map((p: any) => ({
      slug: String(p.slug || p._id),
    }));
  } catch (err) {
    // Graceful fallback: return empty array so builds never fail if DB is slow
    return [];
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const { slug } = await params;

  let product: any = null;
  let relatedProducts: any[] = [];

  try {
    await connectDB();
    
    // Fetch target product by slug or ID fallback
    const query = isValidObjectId(slug) ? { _id: slug } : { slug };
    const productDoc = await Product.findOne(query)
      .populate('category')
      .lean();

    if (productDoc) {
      // Serialize product JSON
      product = JSON.parse(JSON.stringify(productDoc));

      // Simultaneously fetch related products from same category
      if (productDoc.category) {
        const catId = typeof productDoc.category === 'object' ? productDoc.category._id : productDoc.category;
        const relatedDocs = await Product.find({
          category: catId,
          _id: { $ne: productDoc._id }
        })
        .limit(4)
        .lean();

        relatedProducts = JSON.parse(JSON.stringify(relatedDocs));
      }
    }
  } catch (err) {
    console.error("Failed to fetch product server-side:", err);
  }

  if (!product) {
    notFound();
  }

  return (
    <ProductClient
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
