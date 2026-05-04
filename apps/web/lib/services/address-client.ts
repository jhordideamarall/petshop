import { createClient } from '@/lib/supabase/client';
import type { Database } from '@petshop/types/supabase';

export type Address = Database['public']['Tables']['addresses']['Row'];

export async function getUserAddresses() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
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

export async function setDefaultAddress(addressId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // First, set all addresses to not default
  await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);

  // Then set the selected one to default
  const { data, error } = await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('id', addressId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAddress(
  addressId: string,
  fields: Partial<
    Pick<
      Address,
      | 'label'
      | 'recipient_name'
      | 'phone'
      | 'full_address'
      | 'city'
      | 'district'
      | 'postal_code'
      | 'is_default'
    >
  >,
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('addresses')
    .update(fields)
    .eq('id', addressId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAddress(addressId: string) {
  const supabase = createClient();

  const { error } = await supabase.from('addresses').delete().eq('id', addressId);

  if (error) throw error;
}
