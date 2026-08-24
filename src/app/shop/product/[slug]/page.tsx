import connectDB from "@/lib/db";
import Product from "@/models/Product";
import ProductClient from "@/components/ProductClient";
import { notFound } from "next/navigation";
import { isValidObjectId } from "@/lib/sanitize";

// Incremental Static Regeneration (ISR): cached at Edge CDN, revalidates every 60s
export const revalidate = 60;

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
