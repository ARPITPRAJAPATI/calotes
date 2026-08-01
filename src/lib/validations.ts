import { z } from 'zod'; // Import Zod validation library

// ─── User / Auth Schemas ──────────────────────────────────────────────────────

/**
 * Password policy: min 8 chars, at least one uppercase letter, one digit,
 * and one special character. Enforced server-side on registration; client
 * validation is UX-only and provides no security guarantee.
 */
export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .refine((v) => /[A-Z]/.test(v), 'Password must contain at least one uppercase letter')
  .refine((v) => /[0-9]/.test(v), 'Password must contain at least one number')
  .refine((v) => /[^A-Za-z0-9]/.test(v), 'Password must contain at least one special character');

/** Registration request body validation */
export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: PasswordSchema,
});

// ─── Product Schemas ──────────────────────────────────────────────────────────

/** Schema mapping Product validation rules */
export const ProductInputSchema = z.object({
  name: z.string().min(1, 'Product name is required').trim(),
  slug: z.string().min(1, 'Slug is required').trim(),
  description: z.string().min(1, 'Description is required').trim(),
  price: z.number().min(0, 'Price must be a positive number'),
  compareAtPrice: z.number().min(0, 'Compare price must be a positive number').nullable().optional(),
  images: z.array(z.string().min(1)).min(1, 'At least one image is required'),
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

// ─── Category Schema ──────────────────────────────────────────────────────────

/** Schema mapping Category validation rules */
export const CategoryInputSchema = z.object({
  name: z.string().min(1, 'Category name is required').trim(),
  slug: z.string().min(1, 'Slug is required').trim(),
  description: z.string().trim().optional(),
  image: z.string().optional(),
  parent: z.string().nullable().optional(),
});

// ─── Promo Schema ─────────────────────────────────────────────────────────────

/** Schema mapping PromoCode validation rules */
export const PromoInputSchema = z.object({
  code: z.string().min(1, 'Promo code is required').trim().transform((v) => v.toUpperCase()),
  discountType: z.enum(['percentage', 'flat']),
  discountValue: z.number().min(1, 'Discount value must be at least 1'),
  isActive: z.boolean().default(true),
  minOrderAmount: z.number().min(0, 'Minimum order amount must be at least 0').default(0),
  usageLimit: z.number().int().min(0).optional(),       // 0 = unlimited
  perUserLimit: z.number().int().min(1).optional(),      // max uses per unique user
  expiresAt: z.string().datetime().optional(),           // ISO 8601 expiry date
});

// ─── Order Schemas ────────────────────────────────────────────────────────────

/** Single cart item sent by the client — product reference + size + quantity.
 *  Price is NEVER trusted from the client; it is recomputed server-side from DB. */
export const OrderItemClientSchema = z.object({
  product: z.string().optional(),
  productId: z.string().optional(),
  size: z.string().min(1, 'Size is required').max(20),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(10, 'Max 10 per item'),
  name: z.string().optional(),
  price: z.number().optional(),
  image: z.string().optional(),
});

/** Shipping address schema — all fields sanitised, max lengths enforced */
export const CheckoutAddressSchema = z.object({
  fullName:   z.string().min(1, 'Full name is required').max(100).trim(),
  street:     z.string().min(1, 'Street is required').max(200).trim(),
  city:       z.string().min(1, 'City is required').max(100).trim(),
  state:      z.string().min(1, 'State is required').max(100).trim(),
  postalCode: z.string().min(1, 'Postal code is required').max(20).trim(),
  country:    z.string().optional().default('India'),
  phone:      z.string().optional().default(''),
});

/** Full order creation request body */
export const OrderCreateSchema = z.object({
  items: z
    .array(OrderItemClientSchema)
    .min(1, 'Cart is empty')
    .max(20, 'Cart exceeds maximum item limit'),
  shippingAddress: CheckoutAddressSchema,
  couponCode: z.string().max(50).optional(),  // optional promo code to apply server-side
});

// ─── Store Settings Schema ────────────────────────────────────────────────────

/** Schema mapping Store settings validation rules */
export const StoreSettingsInputSchema = z.object({
  heroHeadline: z.string().optional(),
  heroSubtext: z.string().optional(),
  announcementText: z.string().optional(),
  contactEmail: z.string().optional(),
  instagramUrl: z.string().optional(),
  shippingRate: z.number().optional().default(0),
  heroImageUrl: z.string().optional(),
  heroImageMobileUrl: z.string().optional(),
  accentColor: z.string().optional(),
  lookbookImages: z.array(z.object({
    url: z.string(),
    title: z.string().optional().default(''),
    desc: z.string().optional().default(''),
  })).optional().default([]),
  brandStoryImages: z.array(z.object({
    url: z.string(),
    alt: z.string().optional().default(''),
  })).optional().default([]),
  communityPosts: z.array(z.object({
    url: z.string(),
    link: z.string().optional().default(''),
    objectPosition: z.string().optional().default('object-center'),
  })).optional().default([]),
});

