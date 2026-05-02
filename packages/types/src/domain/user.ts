import type { UserRole } from '../enums.js';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  loyaltyPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  recipientName: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pet {
  id: string;
  userId: string;
  name: string;
  type: string;
  breed: string | null;
  weightKg: number | null;
  birthDate: Date | null;
  photoUrl: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
