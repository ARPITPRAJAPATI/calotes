export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  category?: Category | string | any;
  brand: string;
  condition: 'Excellent' | 'Great' | 'Good' | 'Fair';
  sizes: string[];
  sku?: string | null;
  stock: number;
  isFeatured: boolean;
  measurements?: {
    pitToPit?: string | null;
    length?: string | null;
    waist?: string | null;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  createdAt: string;
  avatar?: string;
}

export interface OrderItem {
  product: string | Product;
  name: string;
  size: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Order {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  items: OrderItem[];
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  orderStatus: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  totalAmount: number;
  shippingPrice: number;
  discountAmount: number;
  promoCode?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Promo {
  _id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  isActive: boolean;
  minOrderAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  storeName: string;
  contactEmail: string;
  supportPhone: string;
  freeShippingThreshold: number;
  shippingFlatRate: number;
  featuredPromoCode?: string;
}
