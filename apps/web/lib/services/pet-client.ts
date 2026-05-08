import { createClient } from '@/lib/supabase/client';
import {
  getUserPets as _getUserPets,
  addPet as _addPet,
  updatePet as _updatePet,
  deletePet as _deletePet,
} from '@petshop/api-client/pets';

export type { Pet, PetInsert, PetUpdate } from '@petshop/api-client/pets';

export const getUserPets = () => _getUserPets(createClient());
export const addPet = (pet: Parameters<typeof _addPet>[1]) => _addPet(createClient(), pet);
export const updatePet = (id: string, pet: Parameters<typeof _updatePet>[2]) =>
  _updatePet(createClient(), id, pet);
export const deletePet = (id: string) => _deletePet(createClient(), id);
