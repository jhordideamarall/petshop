import type { BookingStatus, ServiceType } from '../enums.js';
import type { Pet } from './user.js';

export interface Service {
  id: string;
  name: string;
  serviceType: ServiceType;
  description: string | null;
  price: number;
  dpAmount: number | null;
  requiresDp: boolean;
  durationMinutes: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingSlot {
  id: string;
  serviceId: string;
  date: Date;
  startTime: string;
  endTime: string | null;
  capacity: number;
  booked: number;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  userId: string;
  serviceId: string;
  slotId: string;
  petId: string;
  status: BookingStatus;
  dateStart: Date;
  dateEnd: Date | null;
  totalPrice: number;
  dpPaid: number | null;
  notes: string | null;
  cancelledAt: Date | null;
  cancelReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  service?: Service;
  slot?: BookingSlot;
  pet?: Pet;
}
