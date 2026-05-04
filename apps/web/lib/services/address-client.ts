import { createClient } from '@/lib/supabase/client';
import type { Database } from '@petshop/types/supabase';

export type Address = Database['public']['Tables']['addresses']['Row'];

export async function getUserAddresses() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .order('is_default', { ascending: false });

  if (error) {
    console.error('Error fetching addresses:', error);
    return [];
  }

  return data;
}
