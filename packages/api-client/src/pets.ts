import type { TypedSupabaseClient, Pet, PetInsert, PetUpdate } from './types';

export type { Pet, PetInsert, PetUpdate };

export async function getUserPets(supabase: TypedSupabaseClient) {
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

export async function addPet(supabase: TypedSupabaseClient, pet: Omit<PetInsert, 'owner_id'>) {
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

export async function updatePet(supabase: TypedSupabaseClient, id: string, pet: PetUpdate) {
  const { data, error } = await supabase.from('pets').update(pet).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deletePet(supabase: TypedSupabaseClient, id: string) {
  const { error } = await supabase.from('pets').delete().eq('id', id);
  if (error) throw error;
}
