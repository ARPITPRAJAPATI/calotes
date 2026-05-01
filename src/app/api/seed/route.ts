import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';

const SAMPLE_CATEGORIES = [
  { name: 'Mens', slug: 'mens', description: 'Curated vintage menswear.' },
  { name: 'Womens', slug: 'womens', description: 'Hand-picked vintage womenswear.' },
  { name: 'Accessories', slug: 'accessories', description: 'Vintage belts, bags, and more.' },
  { name: 'Outerwear', slug: 'outerwear', description: 'Coats, jackets, and parkas.' },
];

const SAMPLE_PRODUCTS = [
  {
    name: 'VINTAGE HARLEY DAVIDSON TEE',
    slug: 'harley-davidson-tee-90s',
    description: 'Authentic 90s Harley Davidson graphic tee. Single stitch, perfectly faded.',
    price: 2499,
    brand: 'Harley Davidson',
    condition: 'Great',
    sizes: ['L'],
    images: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop'],
    category_slug: 'mens',
    measurements: { pitToPit: '22"', length: '28"' }
  },
  {
    name: '90S CARHARTT DETROIT JACKET',
    slug: 'carhartt-detroit-jacket-brown',
    description: 'Classic Detroit jacket in tan canvas. Beautiful wear and patina.',
    price: 7999,
    compareAtPrice: 9999,
    brand: 'Carhartt',
    condition: 'Excellent',
    sizes: ['M'],
    images: ['https://images.unsplash.com/photo-1559551409-dadc959f76b8?q=80&w=1000&auto=format&fit=crop'],
    category_slug: 'outerwear',
    measurements: { pitToPit: '23"', length: '26"' }
  },
  {
    name: 'LEVIS 501 ORIGINAL FIT',
    slug: 'levis-501-light-wash',
    description: 'Vintage 501s in a perfect light wash. Classic straight leg.',
    price: 3499,
    brand: 'Levis',
    condition: 'Good',
    sizes: ['32x30'],
    images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1000&auto=format&fit=crop'],
    category_slug: 'mens',
    measurements: { waist: '32"', length: '30"' }
  },
  {
    name: 'NIKE SPELLOUT SWEATSHIRT',
    slug: 'nike-spellout-navy',
    description: 'Navy blue Nike sweatshirt with white spellout embroidery on the chest.',
    price: 4299,
    brand: 'Nike',
    condition: 'Great',
    sizes: ['XL'],
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop'],
    category_slug: 'mens',
    measurements: { pitToPit: '25"', length: '29"' }
  },
  {
    name: 'VINTAGE BURBERRY TRENCH',
    slug: 'burberry-trench-beige',
    description: 'Iconic beige trench coat with Nova check lining. Timeless piece.',
    price: 18999,
    brand: 'Burberry',
    condition: 'Excellent',
    sizes: ['L'],
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop'],
    category_slug: 'outerwear',
  }
];

export async function POST() {
  try {
    await connectDB();
    
    // Clear existing
    await Category.deleteMany({});
    await Product.deleteMany({});
    
    // Seed Categories
    const createdCategories = await Category.insertMany(SAMPLE_CATEGORIES);
    
    // Seed Products
    const productsToSeed = SAMPLE_PRODUCTS.map(p => {
      const cat = createdCategories.find(c => c.slug === p.category_slug);
      const { category_slug, ...productData } = p;
      return { ...productData, category: cat?._id };
    });
    
    await Product.insertMany(productsToSeed);

    return NextResponse.json({ message: 'Database seeded successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
