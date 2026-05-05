import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string | number;
  variantId?: string | null;
  variantName?: string | null;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  weight?: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  setItemQuantity: (
    id: string | number,
    variantId: string | null | undefined,
    quantity: number,
  ) => void;
  removeItem: (id: string | number, variantId?: string | null) => void;
  clearCart: () => void;
  getTotalCount: () => number;
}

const isSameItem = (item: CartItem, newItem: Omit<CartItem, 'quantity'>): boolean => {
  if (item.id !== newItem.id) return false;
  const itemVariantId = item.variantId ?? null;
  const newVariantId = newItem.variantId ?? null;
  return itemVariantId === newVariantId;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const quantity = Math.max(1, newItem.quantity ?? 1);
        set((state) => {
          const existingItem = state.items.find((item) => isSameItem(item, newItem));
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                isSameItem(item, newItem) ? { ...item, quantity: item.quantity + quantity } : item,
              ),
            };
          }
          return { items: [...state.items, { ...newItem, quantity }] };
        });
      },
      setItemQuantity: (id, variantId, quantity) => {
        const nextQuantity = Math.max(0, quantity);
        set((state) => {
          if (nextQuantity === 0) {
            return {
              items: state.items.filter(
                (item) => !(item.id === id && (item.variantId ?? null) === (variantId ?? null)),
              ),
            };
          }

          return {
            items: state.items.map((item) =>
              item.id === id && (item.variantId ?? null) === (variantId ?? null)
                ? { ...item, quantity: nextQuantity }
                : item,
            ),
          };
        });
      },
      removeItem: (id, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.id === id && (item.variantId ?? null) === (variantId ?? null)),
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotalCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'petshop-cart-storage',
    },
  ),
);
