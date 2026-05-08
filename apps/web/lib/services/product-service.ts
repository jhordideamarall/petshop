import { createClient } from '@/lib/supabase/server';
import {
  getActiveProducts as _getActiveProducts,
  getActiveCategories as _getActiveCategories,
  getProductBySlug as _getProductBySlug,
} from '@petshop/api-client/products';

export type { Product, Category, ProductWithDetails } from '@petshop/api-client/products';

export const getActiveProducts = async () => _getActiveProducts(await createClient());
export const getActiveCategories = async () => _getActiveCategories(await createClient());
export const getProductBySlug = async (slug: string) =>
  _getProductBySlug(await createClient(), slug);
