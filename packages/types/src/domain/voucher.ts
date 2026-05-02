import type { VoucherType } from '../enums.js';

export interface Voucher {
  id: string;
  code: string;
  voucherType: VoucherType;
  value: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  points: number;
  transactionType: string;
  referenceId: string | null;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  orderItemId: string;
  rating: number;
  comment: string | null;
  photoUrls: string[];
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}
