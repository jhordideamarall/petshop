'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductGrid } from '@/components/shared/product-grid';
import { useCartStore } from '@/stores/cart-store';
import type { ProductCardData } from '@/components/shared/product-card';

const DUMMY_PRODUCTS: ProductCardData[] = [
  {
    id: '1',
    slug: 'makanan-kucing-royal-canin',
    name: 'Makanan Kucing Royal Canin',
    price: 350000,
    promoPrice: 280000,
    imageUrl: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800&q=80',
    category: 'Makanan',
    rating: 4.8,
    reviewCount: 234,
    soldCount: 1200,
  },
  {
    id: '2',
    slug: 'makanan-anjing-pedigree',
    name: 'Makanan Anjing Pedigree',
    price: 180000,
    imageUrl:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
    category: 'Makanan',
    rating: 4.6,
    reviewCount: 156,
    soldCount: 850,
  },
  {
    id: '3',
    slug: 'frozen-daging-sapi',
    name: 'Frozen Daging Sapi Premium',
    price: 450000,
    promoPrice: 380000,
    imageUrl:
      'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=800&q=80',
    category: 'Makanan',
    rating: 4.9,
    reviewCount: 89,
    soldCount: 320,
    type: 'frozen',
  },
  {
    id: '4',
    slug: 'kalung-anjing-kulit',
    name: 'Kalung Anjing Kulit Asli',
    price: 120000,
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80',
    category: 'Aksesoris',
    rating: 4.5,
    reviewCount: 67,
    soldCount: 320,
  },
  {
    id: '5',
    slug: 'tali-leash-retractable',
    name: 'Tali Leash Retractable 5m',
    price: 95000,
    imageUrl: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800&q=80',
    category: 'Aksesoris',
    rating: 4.4,
    reviewCount: 112,
    soldCount: 540,
  },
  {
    id: '6',
    slug: 'vitamin-kucing-premium',
    name: 'Vitamin Kucing Premium',
    price: 150000,
    promoPrice: 120000,
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80',
    category: 'Obat & Vitamin',
    rating: 4.7,
    reviewCount: 78,
    soldCount: 410,
  },
  {
    id: '7',
    slug: 'obat-kutu-frontline',
    name: 'Obat Kutu Frontline',
    price: 220000,
    imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80',
    category: 'Obat & Vitamin',
    rating: 4.8,
    reviewCount: 201,
    soldCount: 890,
  },
  {
    id: '8',
    slug: 'kandang-besi-besar',
    name: 'Kandang Besi Lipat Premium',
    price: 1200000,
    promoPrice: 950000,
    imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&q=80',
    category: 'Kandang',
    rating: 4.6,
    reviewCount: 45,
    soldCount: 120,
  },
  {
    id: '9',
    slug: 'kandang-plastik-travel',
    name: 'Pet Carrier Travel Box',
    price: 350000,
    imageUrl: 'https://images.unsplash.com/photo-1544161513-0179fe746fd5?w=800&q=80',
    category: 'Kandang',
    rating: 4.5,
    reviewCount: 78,
    soldCount: 240,
  },
  {
    id: '10',
    slug: 'shampoo-anjing-sensitif',
    name: 'Shampoo Organic Aloe Vera',
    price: 85000,
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80',
    category: 'Grooming',
    rating: 4.7,
    reviewCount: 134,
    soldCount: 620,
  },
  {
    id: '11',
    slug: 'sisir-slicker',
    name: 'Sisir Slicker Premium Wood',
    price: 65000,
    imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&q=80',
    category: 'Grooming',
    rating: 4.4,
    reviewCount: 89,
    soldCount: 380,
  },
  {
    id: '12',
    slug: 'mainan-kucing-bulu',
    name: 'Mainan Kucing Bulu Interaktif',
    price: 75000,
    promoPrice: 55000,
    imageUrl: 'https://images.unsplash.com/photo-1548546738-8509cb246ed3?w=800&q=80',
    category: 'Mainan',
    rating: 4.6,
    reviewCount: 156,
    soldCount: 710,
  },
];

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
      <div className="flex-1 pt-4">
        <ProductGrid products={filtered} cols={2} onAddToCart={handleAddToCart} />
      </div>
    </div>
  );
}
