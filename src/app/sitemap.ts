import { MetadataRoute } from 'next';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  let products: any[] = [];
  try {
    await connectDB();
    products = await Product.find({ status: 'active' }).select('slug updatedAt');
  } catch (error) {
    console.error("Failed to fetch products for sitemap:", error);
  }

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/shop/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const routes = ['', '/shop', '/about', '/contact', '/login', '/register'].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : 0.7,
    })
  );

  return [...routes, ...productUrls];
}
