// Server Component — fetches data server-side and sends ready HTML to browser (zero client-side API calls)
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Settings from "@/models/Settings";
import HomeClient from "@/components/HomeClient";

// Force dynamic rendering (fetches fresh data from MongoDB on each request)
export const dynamic = 'force-dynamic';

/* ─────────────────────────────────────────────────────────
   Fallback data (used when DB is empty)
   ───────────────────────────────────────────────────────── */
const ARRIVALS = [
  { name: "Vintage Levi's 501",       price: "₹3,499", tag: "Denim",     img: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=70&w=400&auto=format" },
  { name: "Carhartt Detroit Jacket",  price: "₹7,999", tag: "Outerwear", img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=70&w=400&auto=format" },
  { name: "Harley Davidson Tee",      price: "₹2,499", tag: "Tees",      img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=70&w=400&auto=format" },
  { name: "Military Field Jacket",    price: "₹6,499", tag: "Outerwear", img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=70&w=400&auto=format" },
  { name: "Vintage Nike Hoodie",      price: "₹4,299", tag: "Hoodies",   img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=70&w=400&auto=format" },
  { name: "90s Striped Rugby",        price: "₹1,999", tag: "Jerseys",   img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=70&w=400&auto=format" },
];

const CATEGORIES = [
  { title: "Denim",       img: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?q=70&w=400&auto=format", href: "/shop?category=denim" },
  { title: "Outerwear",   img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=70&w=400&auto=format",   href: "/shop?category=outerwear" },
  { title: "Oversized",   img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=70&w=400&auto=format",   href: "/shop?category=oversized" },
  { title: "Plus Size",   img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=70&w=400&auto=format", href: "/shop?category=plus-size" },
];

/* ─────────────────────────────────────────────────────────
   Cloudinary optimization helper
   ───────────────────────────────────────────────────────── */
function optimizeCloudinaryUrl(url: string) {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', '/upload/f_auto,q_auto,w_600/');
}

/* ─────────────────────────────────────────────────────────
   Server Component: fetches data on the server, passes
   pre-rendered props to the client island (HomeClient)
   ───────────────────────────────────────────────────────── */
export default async function Home() {
  // Connect to MongoDB and fetch all data in parallel — server-side, zero round-trips
  let dbProducts: any[] = [];
  let dbCategories: any[] = [];
  let settings: any = null;

  try {
    await connectDB();
    [dbProducts, dbCategories, settings] = await Promise.all([
      Product.find().populate('category').sort('-createdAt').limit(8).lean(),
      Category.find().populate('parent').sort('name').lean(),
      Settings.findOne().lean(),
    ]);
  } catch (err) {
    console.error("Failed to load homepage data on server:", err);
  }

  // Hero settings with fallbacks
  const heroHeadline = settings?.heroHeadline || "Adapt. Stand Out. Be Calotes.";
  const heroSubtext = settings?.heroSubtext || "Hand-picked vintage & streetwear.\nFor the Indian modern icon.";
  const rawHeroUrl = settings?.heroImageUrl || "/images/hero-pc.jpg";
  const heroImageUrl = rawHeroUrl === "/images/hero-pc.png" ? "/images/hero-pc.jpg" : rawHeroUrl;
  const heroImageMobileUrl = settings?.heroImageMobileUrl || "/images/hero-mobile.jpg";

  // Format arrivals list — server-side (no useEffect/useState)
  const arrivalsList = dbProducts.length > 0
    ? dbProducts.map((p: any) => ({
        productId: (p._id || '').toString(),
        name: p.name,
        price: p.price,
        priceFormatted: `₹${p.price.toLocaleString('en-IN')}`,
        tag: p.category?.name || 'Archive',
        img: optimizeCloudinaryUrl(p.images?.[0] || 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=70&w=400&auto=format'),
        imgs: (p.images || ['https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=70&w=400&auto=format']).map(optimizeCloudinaryUrl),
        href: `/shop/product/${p.slug}`,
        slug: p.slug,
      }))
    : ARRIVALS.map((a, idx) => ({
        productId: `static-${idx}`,
        name: a.name,
        price: parseInt(a.price.replace(/[₹,]/g, '')) || 2999,
        priceFormatted: a.price,
        tag: a.tag,
        img: a.img,
        imgs: [a.img],
        href: '/shop',
        slug: '',
      }));

  // Format categories list — server-side
  const categoriesList = dbCategories.length > 0
    ? dbCategories.map((c: any) => ({
        title: c.name,
        img: optimizeCloudinaryUrl(c.image || 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?q=70&w=400&auto=format'),
        href: `/shop?category=${c.slug}`,
      }))
    : CATEGORIES;

  return (
    <HomeClient
      arrivalsList={arrivalsList}
      categoriesList={categoriesList}
      heroHeadline={heroHeadline}
      heroSubtext={heroSubtext}
      heroImageUrl={heroImageUrl}
      heroImageMobileUrl={heroImageMobileUrl}
    />
  );
}
