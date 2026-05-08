import { getShippingRates as _getShippingRates } from '@petshop/api-client/shipping';
import type { CartItem } from '@/stores/cart-store';

export type { ShippingOption } from '@petshop/api-client/shipping';

export const getShippingRates = (addressId: string, items: CartItem[]) =>
  _getShippingRates('', addressId, items);
