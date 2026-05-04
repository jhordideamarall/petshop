import { createClient } from '@/lib/supabase/client';
import type { Database } from '@petshop/types/supabase';

export type Pet = Database['public']['Tables']['pets']['Row'];
export type PetInsert = Database['public']['Tables']['pets']['Insert'];
export type PetUpdate = Database['public']['Tables']['pets']['Update'];

export async function getUserPets() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pets:', error);
    return [];
  }

  return data;
}

export async function addPet(pet: Omit<PetInsert, 'owner_id'>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('pets')
    .insert([{ ...pet, owner_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePet(id: string, pet: PetUpdate) {
  const supabase = createClient();
  const { data, error } = await supabase.from('pets').update(pet).eq('id', id).select().single();

  if (error) throw error;
  return data;
}

export async function deletePet(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from('pets').delete().eq('id', id);

  if (error) throw error;
}
