export interface User {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN';
  phone?: string;
  avatar?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  level: number;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  products?: Product[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sales: number;
  rating: number;
  reviewCount: number;
  images: string[];
  categoryId: string;
  category?: Category;
  isActive: boolean;
  isFreeShipping: boolean;
  origin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  quantity: number;
  selected: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNo: string;
  userId: string;
  user?: User;
  status: OrderStatus;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  shippingAddress: string;
  shippingName: string;
  shippingPhone: string;
  shippingFee: number;
  couponId?: string;
  remark?: string;
  orderItems?: OrderItem[];
  payment?: Payment;
  shipping?: Shipping;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  paymentNo: string;
  amount: number;
  method: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingTrack {
  time: string;
  description: string;
  location?: string;
}

export interface Shipping {
  id: string;
  orderId: string;
  trackingNo?: string;
  company?: string;
  status: 'PENDING' | 'SHIPPED' | 'TRANSIT' | 'DELIVERED';
  tracks: ShippingTrack[];
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  user?: User;
  productId: string;
  product?: Product;
  orderId: string;
  rating: number;
  content: string;
  images?: string[];
  reply?: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  type: 'FIXED' | 'PERCENT';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  totalCount: number;
  usedCount: number;
  perUserLimit: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
}

export interface UserCoupon {
  id: string;
  userId: string;
  couponId: string;
  coupon?: Coupon;
  status: 'UNUSED' | 'USED' | 'EXPIRED';
  usedAt?: string;
  receivedAt: string;
}

export interface Promotion {
  id: string;
  name: string;
  type: 'DISCOUNT' | 'FLASH_SALE';
  discountRate: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  productIds?: string[];
  createdAt: string;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
