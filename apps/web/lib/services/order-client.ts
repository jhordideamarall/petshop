import { createClient } from '@/lib/supabase/client';
import {
  getUserOrders as _getUserOrders,
  getOrderDetail as _getOrderDetail,
  createOrder as _createOrder,
} from '@petshop/api-client/orders';
import { generateOrderNumber } from '@petshop/utils/order';

export type { OrderWithItems, CheckoutPayload } from '@petshop/api-client/orders';

export const getUserOrders = () => _getUserOrders(createClient());
export const getOrderDetail = (id: string) => _getOrderDetail(createClient(), id);
export const createOrder = (payload: Parameters<typeof _createOrder>[1]) =>
  _createOrder(createClient(), payload, generateOrderNumber());
