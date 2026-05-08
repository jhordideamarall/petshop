'use client';
import { ProductCard, type ProductCardData } from '@/components/shared/product-card';
import { useCartStore } from '@/stores/cart-store';

interface BestOffersGridProps {
  products?: ProductCardData[];
}

export function BestOffersGrid({ products = [] }: BestOffersGridProps) {
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
        padding: '0 clamp(16px, 5vw, 20px)',
      }}
    >
      {products.map((p, index) => (
        <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} priority={index < 2} />
      ))}
    </div>
  );
}
