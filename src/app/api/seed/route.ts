import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// Predefined mock category arrays to seed the collections
const SAMPLE_CATEGORIES = [
  { name: 'Mens', slug: 'mens', description: 'Curated vintage menswear.' },
  { name: 'Womens', slug: 'womens', description: 'Hand-picked vintage womenswear.' },
  { name: 'Accessories', slug: 'accessories', description: 'Vintage belts, bags, and more.' },
  { name: 'Outerwear', slug: 'outerwear', description: 'Coats, jackets, and parkas.' },
];

// Predefined mock product list items arrays to seed the collections
const SAMPLE_PRODUCTS = [
  {
    name: 'VINTAGE HARLEY DAVIDSON TEE',
    slug: 'harley-davidson-tee-90s',
    sku: 'CV-HD-001',
    description: 'Authentic 90s Harley Davidson graphic tee. Single stitch, perfectly faded.',
    price: 2499,
    brand: 'Harley Davidson',
    condition: 'Great',
    sizes: ['L'],
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop'
    ],
    category_slug: 'mens',
    measurements: { pitToPit: '22"', length: '28"' }
  },
  {
    name: '90S CARHARTT DETROIT JACKET',
    slug: 'carhartt-detroit-jacket-brown',
    sku: 'CV-CJ-002',
    description: 'Classic Detroit jacket in tan canvas. Beautiful wear and patina.',
    price: 7999,
    compareAtPrice: 9999,
    brand: 'Carhartt',
    condition: 'Excellent',
    sizes: ['M'],
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000&auto=format&fit=crop'
    ],
    category_slug: 'outerwear',
    measurements: { pitToPit: '23"', length: '26"' }
  },
  {
    name: 'LEVIS 501 ORIGINAL FIT',
    slug: 'levis-501-light-wash',
    sku: 'CV-LV-003',
    description: 'Vintage 501s in a perfect light wash. Classic straight leg.',
    price: 3499,
    brand: 'Levis',
    condition: 'Good',
    sizes: ['32x30'],
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?q=80&w=1000&auto=format&fit=crop'
    ],
    category_slug: 'mens',
    measurements: { waist: '32"', length: '30"' }
  },
  {
    name: 'NIKE SPELLOUT SWEATSHIRT',
    slug: 'nike-spellout-navy',
    sku: 'CV-NK-004',
    description: 'Navy blue Nike sweatshirt with white spellout embroidery on the chest.',
    price: 4299,
    brand: 'Nike',
    condition: 'Great',
    sizes: ['XL'],
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop'
    ],
    category_slug: 'mens',
    measurements: { pitToPit: '25"', length: '29"' }
  },
  {
    name: 'VINTAGE BURBERRY TRENCH',
    slug: 'burberry-trench-beige',
    sku: 'CV-BB-005',
    description: 'Iconic beige trench coat with Nova check lining. Timeless piece.',
    price: 18999,
    brand: 'Burberry',
    condition: 'Excellent',
    sizes: ['L'],
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop'
    ],
    category_slug: 'outerwear',
  }
];

// POST seed handler: resets and populates database collection tables with mockup items (Development ONLY)
export async function POST() {
  try {
    // SECURITY: Strictly restrict database seeding to development environment
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Database seeding is disabled in production' }, { status: 403 });
    }

    await connectDB();
    
    // Only seed categories if none exist
    let createdCategories = await Category.find({});
    if (createdCategories.length === 0) {
      createdCategories = await Category.insertMany(SAMPLE_CATEGORIES);
      console.log('Seeded categories.');
    }
    
    // Only seed products if none exist
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const productsToSeed = SAMPLE_PRODUCTS.map(p => {
        const cat = createdCategories.find(c => c.slug === p.category_slug);
        const { category_slug, ...productData } = p;
        return { ...productData, category: cat?._id };
      });
      await Product.insertMany(productsToSeed);
      console.log('Seeded products.');
    }

    // Only seed admin if doesn't exist
    const adminExists = await User.findOne({ email: 'admin@calotes.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin Calotes',
        email: 'admin@calotes.com',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('Seeded admin user.');
    }

    return NextResponse.json({ message: 'Database seeding completed (checked existences)' });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}


