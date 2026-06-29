import { NextResponse } from 'next/server'; // Import response helper
import connectDB from '@/lib/db'; // Import DB connection singleton
import Product from '@/models/Product'; // Import Product schema model
import Category from '@/models/Category'; // Import Category schema model
import User from '@/models/User'; // Import User schema model
import bcrypt from 'bcryptjs'; // Import bcryptjs password hashing library

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
    description: 'Authentic 90s Harley Davidson graphic tee. Single stitch, perfectly faded.',
    price: 2499,
    brand: 'Harley Davidson',
    condition: 'Great',
    sizes: ['L'],
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop'
    ],
    category_slug: 'mens', // temporary field to link categories
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
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000&auto=format&fit=crop'
    ],
    category_slug: 'outerwear', // temporary field to link categories
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
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?q=80&w=1000&auto=format&fit=crop'
    ],
    category_slug: 'mens', // temporary field to link categories
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
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop'
    ],
    category_slug: 'mens', // temporary field to link categories
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
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop'
    ],
    category_slug: 'outerwear', // temporary field to link categories
  }
];

// POST seed handler: resets and populates database collection tables with mockup items (Development helper)
export async function POST() {
  try {
    // 1. Establish connection to MongoDB database
    await connectDB();
    
    // 2. Clear pre-existing collection entries to ensure fresh state
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({ email: 'admin@calotes.com' }); // Delete matching admin record

    // 3. Seed default Admin User credentials
    const hashedPassword = await bcrypt.hash('admin123', 10); // Hash default password 'admin123'
    await User.create({
      name: 'Admin Calotes',
      email: 'admin@calotes.com',
      password: hashedPassword,
      role: 'admin', // Allocate admin privileges
    });
    
    // 4. Seed default categories list in bulk
    const createdCategories = await Category.insertMany(SAMPLE_CATEGORIES);
    
    // 5. Seed default products by mapping category ObjectIds based on slugs matching
    const productsToSeed = SAMPLE_PRODUCTS.map(p => {
      const cat = createdCategories.find(c => c.slug === p.category_slug);
      const { category_slug, ...productData } = p;
      return { ...productData, category: cat?._id }; // Assign actual category ObjectId reference
    });
    
    // Bulk insert products list
    await Product.insertMany(productsToSeed);

    return NextResponse.json({ message: 'Database seeded successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

