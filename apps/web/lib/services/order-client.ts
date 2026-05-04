import { createClient } from '@/lib/supabase/client';
import type { Database } from '@petshop/types/supabase';

export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];

export interface OrderWithItems extends Order {
  order_items: (OrderItem & {
    products?: {
      name: string;
      image_urlText?: string;
    };
  })[];
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
          name
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
          name
        )
      )
    `,
    )
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as OrderWithItems;
}
