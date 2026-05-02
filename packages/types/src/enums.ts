export enum UserRole {
  Customer = 'customer',
  Admin = 'admin',
  Owner = 'owner',
}

export enum ProductType {
  Normal = 'normal',
  Frozen = 'frozen',
  Parcel = 'parcel',
}

export enum OrderStatus {
  Pending = 'pending',
  WaitingPayment = 'waiting_payment',
  Paid = 'paid',
  Processing = 'processing',
  Shipped = 'shipped',
  Delivered = 'delivered',
  Completed = 'completed',
  Cancelled = 'cancelled',
  Expired = 'expired',
  Returned = 'returned',
}

export enum PaymentMethod {
  BankTransfer = 'bank_transfer',
  CreditCard = 'credit_card',
  Qris = 'qris',
  Ewallet = 'ewallet',
  Cod = 'cod',
}

export enum PaymentStatus {
  Pending = 'pending',
  Paid = 'paid',
  Failed = 'failed',
  Expired = 'expired',
  Refunded = 'refunded',
}

export enum BookingStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  InProgress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled',
  NoShow = 'no_show',
}

export enum ServiceType {
  Grooming = 'grooming',
  Hotel = 'hotel',
}

export enum PetType {
  Dog = 'dog',
  Cat = 'cat',
  Bird = 'bird',
  Fish = 'fish',
  Rabbit = 'rabbit',
  Other = 'other',
}

export enum VoucherType {
  Percentage = 'percentage',
  Fixed = 'fixed',
}

export enum LoyaltyTransactionType {
  Earn = 'earn',
  Redeem = 'redeem',
  Expire = 'expire',
  Adjust = 'adjust',
}

export enum StockMovementType {
  Purchase = 'purchase',
  Sale = 'sale',
  Return = 'return',
  Adjustment = 'adjustment',
}
