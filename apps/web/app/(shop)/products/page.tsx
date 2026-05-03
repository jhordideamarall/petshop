'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductGrid } from '@/components/shared/product-grid';
import { useCartStore } from '@/stores/cart-store';
import type { ProductCardData } from '@/components/shared/product-card';
import { DUMMY_PRODUCTS } from '@/lib/dummy-products';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const activeCat = searchParams.get('category');
  const [sort] = useState<'popular' | 'rating' | 'low' | 'high'>('popular');

  const addItem = useCartStore((state) => state.addItem);

  const filtered = useMemo(() => {
    let list = DUMMY_PRODUCTS;

    if (activeCat) {
      list = list.filter((p) => p.category?.toLowerCase() === activeCat.toLowerCase());
    }

    if (sort === 'popular') {
      list = [...list].sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0));
    }
    if (sort === 'rating') {
      list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }
    if (sort === 'low') {
      list = [...list].sort((a, b) => (a.promoPrice ?? a.price) - (b.promoPrice ?? b.price));
    }
    if (sort === 'high') {
      list = [...list].sort((a, b) => (b.promoPrice ?? b.price) - (a.promoPrice ?? a.price));
    }

    return list;
  }, [activeCat, sort]);

  const handleAddToCart = (p: ProductCardData) => {
    addItem({
      id: p.id,
      name: p.name,
      price: p.promoPrice ?? p.price,
      imageUrl: p.imageUrl,
    });
  };

  return (
    <div className="flex flex-col min-h-screen pb-10">
      <div className="flex-1 pt-14">
        <ProductGrid products={filtered} cols={2} onAddToCart={handleAddToCart} />
      </div>
    </div>
  );
}
