import type { CartItem } from '@/stores/cart-store';

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  etd: string;
  courier_code: string;
  courier_name: string;
  service_code: string;
  service_name: string;
}

export async function getShippingRates(addressId: string, items: CartItem[]) {
  const response = await fetch('/api/shipping/rates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ addressId, items }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Gagal mengambil ongkir');
  }

  return data as ShippingOption[];
}
