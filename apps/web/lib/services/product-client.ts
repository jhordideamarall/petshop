import { createClient } from '@/lib/supabase/client';
import {
  getActiveProducts as _getActiveProducts,
  getActiveCategories as _getActiveCategories,
} from '@petshop/api-client/products';

export type { Product, Category, ProductWithDetails } from '@petshop/api-client/products';

export const getActiveProducts = () => _getActiveProducts(createClient());
export const getActiveCategories = () => _getActiveCategories(createClient());
