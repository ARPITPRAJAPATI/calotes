import connectDB from "@/lib/db";
import Product from "@/models/Product";
import ProductClient from "@/components/ProductClient";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const { slug } = await params;

  let product: any = null;
  let relatedProducts: any[] = [];

  try {
    await connectDB();
    
    // Fetch target product by slug
    const productDoc = await Product.findOne({ slug })
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
