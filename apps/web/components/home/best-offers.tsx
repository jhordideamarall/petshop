'use client';
import { ProductCard, type ProductCardData } from '@/components/shared/product-card';
import { useCartStore } from '@/stores/cart-store';
const PLACEHOLDER_PRODUCTS: ProductCardData[] = [
  {
    id: '1',
    slug: 'dog-food-premium',
    name: 'Dog Food Premium',
    price: 450000,
    promoPrice: 385000,
    imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80',
    rating: 4.8,
    soldCount: 1240,
  },
  {
    id: '2',
    slug: 'cat-food-indoor',
    name: 'Cat Food Indoor Premium',
    price: 89000,
    promoPrice: 72000,
    imageUrl:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    soldCount: 890,
  },
  {
    id: '3',
    slug: 'vitamin-anjing-kucing',
    name: 'Vitamin Booster Pet',
    price: 145000,
    promoPrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800&q=80',
    rating: 4.5,
    soldCount: 320,
  },
  {
    id: '4',
    slug: 'collar-adjustable',
    name: 'Collar Adjustable Leather',
    price: 125000,
    promoPrice: 98000,
    imageUrl: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=800&q=80',
    rating: 4.7,
    soldCount: 560,
  },
];

export function BestOffersGrid() {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (product: ProductCardData) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.promoPrice ?? product.price,
      imageUrl: product.imageUrl,
    });
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12,
        padding: '0 16px',
      }}
    >
      {PLACEHOLDER_PRODUCTS.map((p) => (
        <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
      ))}
    </div>
  );
}
