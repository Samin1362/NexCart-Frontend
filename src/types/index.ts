// ========================
// User
// ========================

export interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export type UserRole = 'USER' | 'ADMIN';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone: string;
  address: IAddress;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

// ========================
// Category
// ========================

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

// ========================
// Product
// ========================

export interface ISpecification {
  key: string;
  value: string;
}

export interface IProduct {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice: number;
  images: string[];
  category: ICategory | string;
  brand: string;
  stock: number;
  sold: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  specifications: ISpecification[];
  isFeatured: boolean;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ========================
// Review
// ========================

export interface IReview {
  _id: string;
  userId: IUser | string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

// ========================
// Cart
// ========================

export interface ICartItem {
  productId: IProduct | string;
  quantity: number;
  price: number;
}

export interface ICart {
  _id: string;
  userId: string;
  items: ICartItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// ========================
// Order
// ========================

export type PaymentMethod = 'COD' | 'CARD' | 'BKASH' | 'NAGAD';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface IOrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  userId: IUser | string;
  items: IOrderItem[];
  shippingAddress: IAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  subtotal: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  notes: string;
  cancelReason: string;
  deliveredAt: string;
  createdAt: string;
  updatedAt: string;
}

// ========================
// API Response
// ========================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  errorDetails?: string;
}

// ========================
// Wishlist
// ========================

export interface WishlistContextType {
  wishlistItems: IProduct[];
  wishlistIds: Set<string>;
  wishlistCount: number;
  isLoading: boolean;
  toggleWishlist: (product: IProduct) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isWishlisted: (productId: string) => boolean;
}

// ========================
// Auth
// ========================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

// ========================
// Dashboard
// ========================

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
}

export interface RevenueByMonth {
  month: string;
  year: number;
  revenue: number;
}

export interface OrdersByStatus {
  status: string;
  count: number;
}

export interface TopCategory {
  category: string;
  count: number;
}

export interface TopProduct {
  productId: string;
  title: string;
  image: string;
  totalQty: number;
  totalRevenue: number;
}

export interface ChartData {
  revenueByMonth: RevenueByMonth[];
  ordersByStatus: OrdersByStatus[];
  topCategories: TopCategory[];
}
