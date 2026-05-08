import { createClient } from '@/lib/supabase/client';
import {
  getUserLoyalty as _getUserLoyalty,
  getUserLoyaltyHistory as _getUserLoyaltyHistory,
} from '@petshop/api-client/loyalty';

export type { Loyalty } from '@petshop/api-client/loyalty';

export const getUserLoyalty = () => _getUserLoyalty(createClient());
export const getUserLoyaltyHistory = () => _getUserLoyaltyHistory(createClient());
