import { createClient } from '@/lib/supabase/client';
import type { Database } from '@petshop/types/supabase';

export type Loyalty = Database['public']['Tables']['loyalty']['Row'];

export async function getUserLoyalty() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('loyalty')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is no rows returned, which might be fine initially
    console.error('Error fetching loyalty:', error);
    return null;
  }

  return data;
}
