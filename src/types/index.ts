
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string;
  subcategory: string;
  colors: string[];
  sizes: string[];
  in_stock: boolean;
  rating: number;
  reviews: number;
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  createdAt: string;
  images_by_color?: string;
}

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  avatar?: string;
  addresses: Address[];
  phone?: string; // Added phone property
  createdAt: string;
  token?: string;
}
export interface AuthResponse {
  user: User;
  token: string;
}
export type Address = {
  id: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  default: boolean;
}

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  color: string;
  size: string;
}

export type WishlistItem = {
  id: string;
  productId: string;
}

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string; // Added description property
  image?: string; // Added image property
  productCount?: number; // Added productCount property
  subcategories?: Category[];
}

export type Coupon = {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumPurchase?: number;
  validFrom: string;
  validTo: string;
  maxUses?: number;
  usedCount: number;
  active: boolean;
}




export interface PaginatedCategoryResponse {
  data: Category[];
  total: number;
  page: number;
  limit: number;
}

type ApiResponse = {
  data: Category[];
  total: number;
  page: number;
  limit: number;
}