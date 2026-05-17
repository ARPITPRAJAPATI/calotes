import { z } from 'zod';

// Auth Schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Product API Schemas
export const productQuerySchema = z.object({
  page: z.string().optional().transform(val => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform(val => (val ? parseInt(val) : 12)),
  category: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(['newest', 'price-low', 'price-high', 'popular']).optional().default('newest'),
  minPrice: z.string().optional().transform(val => (val ? parseInt(val) : undefined)),
  maxPrice: z.string().optional().transform(val => (val ? parseInt(val) : undefined)),
  brand: z.string().optional(),
  condition: z.string().optional(),
  size: z.string().optional(),
});

// Order Schemas
export const orderItemSchema = z.object({
  product: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number().min(1),
  size: z.string().optional(),
  image: z.string().optional(),
});

export const shippingAddressSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(6),
  landmark: z.string().optional(),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  totalAmount: z.number().min(0),
  shippingAddress: shippingAddressSchema,
});
