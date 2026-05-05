import { createClient } from '@/lib/supabase/client';
import type { Database } from '@petshop/types/supabase';
import { generateOrderNumber } from '@petshop/utils/order';

export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];

export interface OrderWithItems extends Order {
  order_items: (OrderItem & {
    products?: {
      name: string;
      product_images?: {
        url: string;
      }[];
    };
  })[];
}

export interface CheckoutPayload {
  addressId: string;
  items: {
    product_id: string;
    variant_id: string | null;
    quantity: number;
    price: number;
    product_name: string;
    variant_name: string | null;
  }[];
  total: number;
  subtotal: number;
  shippingCost: number;
  shippingCourier: string;
  totalWeight: number;
}

export async function getUserOrders() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      order_items (
        *,
        products (
          name,
          product_images (
            url
          )
        )
      )
    `,
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data as OrderWithItems[];
}

export async function getOrderDetail(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      order_items (
        *,
        products (
          name,
          product_images (
            url
          )
        )
      )
    `,
    )
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as OrderWithItems;
}

export async function createOrder(payload: CheckoutPayload) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Anda harus login untuk membuat pesanan');

  const orderNumber = generateOrderNumber();

  const { data, error } = await supabase.rpc('create_order_v1', {
    p_user_id: user.id,
    p_address_id: payload.addressId,
    p_items: payload.items,
    p_order_number: orderNumber,
    p_total: payload.total,
    p_subtotal: payload.subtotal,
    p_shipping_cost: payload.shippingCost,
    p_shipping_courier: payload.shippingCourier,
    p_total_weight: payload.totalWeight,
  });

  if (error) {
    console.error('ERROR_CREATE_ORDER:', JSON.stringify(error, null, 2));
    throw new Error(error.message || 'Gagal membuat pesanan');
  }

  return data as string; // returns order_id
}
