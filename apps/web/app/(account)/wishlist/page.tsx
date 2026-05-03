'use client';

import { useRouter } from 'next/navigation';
import { m } from 'framer-motion';
import { ArrowLeft, Heart, ShoppingCart } from 'lucide-react';

interface WishlistItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  emoji: string;
}

const DUMMY_WISHLIST: WishlistItem[] = [
  {
    id: 'w1',
    name: 'Royal Canin Medium Adult 4kg',
    brand: 'Royal Canin',
    price: 320000,
    originalPrice: 390000,
    emoji: '🐾',
  },
  {
    id: 'w2',
    name: 'Tempat Minum Otomatis Stainless',
    brand: 'PetLife',
    price: 185000,
    emoji: '💧',
  },
  {
    id: 'w3',
    name: 'Tali Kekang Kulit Premium L',
    brand: 'DogStyle',
    price: 220000,
    originalPrice: 280000,
    emoji: '🦮',
  },
  {
    id: 'w4',
    name: 'Vitamin C Kucing 60 Tablet',
    brand: 'VetCare',
    price: 95000,
    emoji: '💊',
  },
];

function formatPrice(v: number) {
  return `Rp ${v.toLocaleString('id-ID')}`;
}

export default function WishlistPage() {
  const router = useRouter();

  return (
    <div className="bg-[#FDFCFB]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-stone-2 bg-[#FDFCFB]/90 px-5 pb-4 pt-[max(18px,env(safe-area-inset-top))] backdrop-blur-xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-semibold text-ink-3"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>
        <h1 className="mt-3 font-heading text-[22px] font-extrabold text-ink">Wishlist</h1>
      </header>

      <main className="px-5 py-5">
        {DUMMY_WISHLIST.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Heart size={48} className="text-ink-4" />
            <p className="mt-4 font-heading text-[16px] font-extrabold text-ink">Wishlist kosong</p>
            <p className="mt-1 text-[13px] text-ink-3">
              Simpan produk favoritmu untuk dibeli nanti.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {DUMMY_WISHLIST.map((item, i) => (
              <m.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3.5 rounded-[20px] bg-white p-3.5 shadow-[0_2px_14px_rgba(0,0,0,0.05)]"
              >
                {/* Thumbnail */}
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-[#F5F3F0] text-[26px]">
                  {item.emoji}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-ink-3">{item.brand}</p>
                  <p className="font-heading text-[14px] font-extrabold leading-snug text-ink">
                    {item.name}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-heading text-[14px] font-extrabold text-primary">
                      {formatPrice(item.price)}
                    </span>
                    {item.originalPrice && (
                      <span className="text-[12px] font-medium text-ink-4 line-through">
                        {formatPrice(item.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Add to cart */}
                <button
                  type="button"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-[0_4px_12px_rgba(224,123,57,0.3)] active:scale-90"
                  style={{ transition: 'transform 0.1s' }}
                >
                  <ShoppingCart size={16} strokeWidth={2.5} />
                </button>
              </m.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
