import { createClient } from '@/lib/supabase/client';
import type { Database } from '@petshop/types/supabase';

export type Wishlist = Database['public']['Tables']['wishlists']['Row'];

export async function getUserWishlist() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('wishlists')
    .select(
      `
      *,
      products (
        id,
        name,
        price,
        promo_price,
        product_images (
          url
        )
      )
    `,
    )
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }

  return data;
}

export async function toggleWishlist(productId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  // Check if exists
  const { data: existing } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('wishlists').delete().eq('id', existing.id);
    if (error) throw error;
    return { status: 'removed' };
  } else {
    const { error } = await supabase
      .from('wishlists')
      .insert([{ user_id: user.id, product_id: productId }]);
    if (error) throw error;
    return { status: 'added' };
  }
}
