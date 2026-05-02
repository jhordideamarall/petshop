import type { OrderStatus, PaymentMethod, PaymentStatus } from '../enums.js';
import type { Address } from './user.js';
import type { ProductVariant } from './product.js';

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  priceSnapshot: number;
  createdAt: Date;
  updatedAt: Date;
  variant?: ProductVariant;
}

export interface Cart {
  id: string;
  userId: string | null;
  sessionId: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: CartItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  productName: string;
  variantName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  addressId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shippingCost: number;
  discount: number;
  voucherDiscount: number;
  loyaltyDiscount: number;
  total: number;
  courierCode: string | null;
  trackingNumber: string | null;
  notes: string | null;
  paidAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
  address?: Address;
}
