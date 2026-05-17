import { z } from 'zod';

export const ProductInputSchema = z.object({
  name: z.string().min(1, 'Product name is required').trim(),
  slug: z.string().min(1, 'Slug is required').trim(),
  description: z.string().min(1, 'Description is required').trim(),
  price: z.number().min(0, 'Price must be a positive number'),
  compareAtPrice: z.number().min(0, 'Compare price must be a positive number').nullable().optional(),
  images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required'),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().trim().default('Vintage'),
  condition: z.enum(['Excellent', 'Great', 'Good', 'Fair']).default('Great'),
  sizes: z.array(z.string()).min(1, 'At least one size must be selected'),
  sku: z.string().nullable().optional(),
  stock: z.number().int().min(0, 'Stock must be at least 0').default(1),
  isFeatured: z.boolean().default(false),
  measurements: z.object({
    pitToPit: z.string().nullable().optional(),
    length: z.string().nullable().optional(),
    waist: z.string().nullable().optional(),
  }).optional(),
  tags: z.array(z.string()).optional(),
});

export const CategoryInputSchema = z.object({
  name: z.string().min(1, 'Category name is required').trim(),
  slug: z.string().min(1, 'Slug is required').trim(),
  description: z.string().trim().optional(),
  parent: z.string().nullable().optional(),
});

export const PromoInputSchema = z.object({
  code: z.string().min(1, 'Promo code is required').trim().transform(v => v.toUpperCase()),
  discountType: z.enum(['percentage', 'flat']),
  discountValue: z.number().min(1, 'Discount value must be at least 1'),
  isActive: z.boolean().default(true),
  minOrderAmount: z.number().min(0, 'Minimum order amount must be at least 0').default(0),
});

export const StoreSettingsInputSchema = z.object({
  storeName: z.string().min(1, 'Store name is required').trim(),
  contactEmail: z.string().email('Invalid email address').trim(),
  supportPhone: z.string().min(1, 'Support phone is required').trim(),
  freeShippingThreshold: z.number().min(0, 'Threshold must be at least 0'),
  shippingFlatRate: z.number().min(0, 'Flat rate must be at least 0'),
  featuredPromoCode: z.string().optional(),
});
