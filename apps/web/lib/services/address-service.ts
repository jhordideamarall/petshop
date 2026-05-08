import { createClient } from '@/lib/supabase/server';
import { getUserAddresses as _getUserAddresses } from '@petshop/api-client/addresses';

export type { Address } from '@petshop/api-client/addresses';

export const getUserAddresses = async () => _getUserAddresses(await createClient());
