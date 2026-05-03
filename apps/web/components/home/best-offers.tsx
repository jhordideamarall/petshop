'use client';
import { ProductCard, type ProductCardData } from '@/components/shared/product-card';
import { getFeaturedProducts } from '@/lib/dummy-products';
import { useCartStore } from '@/stores/cart-store';

const FEATURED_PRODUCTS = getFeaturedProducts();

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
      {FEATURED_PRODUCTS.map((p, index) => (
        <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} priority={index < 2} />
      ))}
    </div>
  );
}
