'use client';
import { ProductCard, type ProductCardData } from '@/components/shared/product-card';
import { toast } from 'sonner';

const PLACEHOLDER_PRODUCTS: ProductCardData[] = [
  {
    id: '1',
    slug: 'dog-food-premium',
    name: 'Dog Food Premium',
    price: 450000,
    promoPrice: 385000,
    imageColor: '#D4C4A0',
    imageLabel: 'Dog Food',
    rating: 4.8,
    soldCount: 1240,
  },
  {
    id: '2',
    slug: 'cat-food-indoor',
    name: 'Cat Food Indoor',
    price: 89000,
    promoPrice: 72000,
    imageColor: '#C4B8D4',
    imageLabel: 'Cat Food',
    rating: 4.6,
    soldCount: 890,
  },
  {
    id: '3',
    slug: 'vitamin-anjing-kucing',
    name: 'Vitamin Anjing & Kucing',
    price: 145000,
    promoPrice: null,
    imageColor: '#B8D4B8',
    imageLabel: 'Vitamin',
    rating: 4.5,
    soldCount: 320,
  },
  {
    id: '4',
    slug: 'collar-adjustable',
    name: 'Collar Adjustable Premium',
    price: 125000,
    promoPrice: 98000,
    imageColor: '#D4B8B8',
    imageLabel: 'Collar',
    rating: 4.7,
    soldCount: 560,
  },
];

export function BestOffersGrid() {
  const handleAddToCart = (product: ProductCardData) => {
    toast.success(`${product.name} ditambahkan ke keranjang`, {
      duration: 2000,
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
