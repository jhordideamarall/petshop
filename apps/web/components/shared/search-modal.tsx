'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getActiveProducts } from '@/lib/services/product-client';
import { Loader2 } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatPrice(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

const CloseIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SearchInputIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#A09890"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

function getSmartFallbackImage(productName: string): string {
  const query = encodeURIComponent(productName.toLowerCase());
  return `https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80&sig=${query}`;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getActiveProducts,
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      return products.filter((p) => (p.promoPrice ?? 0) > 0);
    }

    return products.filter((p) =>
      [p.name, p.slug].filter(Boolean).some((value) => value!.toLowerCase().includes(q)),
    );
  }, [query, products]);

  const trimmedQuery = query.trim();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            key="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 z-[105]"
            style={{
              background: 'rgba(20,16,12,0.55)',
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)',
            }}
          />

          {/* Modal card */}
          <m.div
            key="search-modal"
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed z-[210] left-1/2 -translate-x-1/2 w-[calc(100vw-32px)] lg:w-[680px]"
            style={{
              top: 'calc(24px + env(safe-area-inset-top))',
              maxWidth: '92vw',
              background: 'rgba(253,252,251,0.85)',
              borderRadius: 36,
              border: '1px solid rgba(255,255,255,0.4)',
              boxShadow: '0 20px 60px rgba(32,22,14,0.12), 0 4px 12px rgba(32,22,14,0.06)',
              overflow: 'hidden',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            }}
          >
            {/* Subtle Search input row — No heavy border bottom for a 'joined' feel */}
            <div className="flex items-center gap-3 px-4 lg:px-8 pt-6 pb-2">
              <div
                className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-5"
                style={{
                  height: 56,
                  background: 'rgba(245,243,240,0.5)',
                  border: '1px solid rgba(216,212,206,0.3)',
                }}
              >
                <SearchInputIcon />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari produk atau layanan..."
                  className="min-w-0 flex-1 bg-transparent font-heading font-semibold text-ink outline-none placeholder:text-[#A09890]"
                  style={{ fontSize: 17 }}
                />
                {trimmedQuery && (
                  <m.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    type="button"
                    onClick={() => setQuery('')}
                    className="rounded-full bg-white/60 px-3 py-1 font-heading text-[10px] font-bold tracking-wider text-[#A09890]"
                  >
                    HAPUS
                  </m.button>
                )}
              </div>
              <m.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="flex items-center justify-center rounded-full transition-colors hover:bg-white/40"
                style={{
                  width: 56,
                  height: 56,
                  color: '#7A746E',
                  flexShrink: 0,
                }}
                aria-label="Tutup pencarian"
              >
                <CloseIcon />
              </m.button>
            </div>

            {/* Section label */}
            <div className="flex items-center justify-between px-6 pt-4 pb-2">
              <div>
                <span className="font-heading text-[11px] font-bold tracking-widest uppercase text-[#A09890]">
                  {trimmedQuery ? 'Hasil Pencarian' : 'Diskon Spesial'}
                </span>
                <p className="mt-1 font-sans text-[12px] font-medium text-[#7A746E]">
                  {trimmedQuery
                    ? `${results.length} produk cocok`
                    : 'Produk promo yang sering dibeli'}
                </p>
              </div>
              {!trimmedQuery && (
                <span
                  className="rounded-full px-3 py-1 font-heading text-[11px] font-bold"
                  style={{ background: '#FFF3EA', color: '#E07B39' }}
                >
                  PROMO HARI INI
                </span>
              )}
            </div>

            {/* Product list */}
            <div className="overflow-y-auto px-4 pb-6" style={{ maxHeight: '60vh' }}>
              {isLoading ? (
                <div className="flex h-48 items-center justify-center">
                  <Loader2 className="animate-spin text-primary" size={28} />
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-[#A09890]">
                  <div
                    className="flex items-center justify-center rounded-3xl"
                    style={{ width: 64, height: 64, background: '#F5F3F0' }}
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <p className="mt-6 font-heading text-[17px] font-extrabold text-ink">
                    Yah, produknya gak ketemu...
                  </p>
                  <p className="mt-2 max-w-xs font-sans text-[14px] leading-relaxed">
                    Coba ketik kata kunci lain atau cek ejaanmu lagi ya, Paw Parents!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {results.map((product, i) => {
                    const displayPrice = product.promoPrice ?? product.price;
                    const hasDiscount = (product.promoPrice ?? 0) > 0;
                    const discountPct = hasDiscount
                      ? Math.round(((product.price - product.promoPrice!) / product.price) * 100)
                      : 0;

                    return (
                      <m.div
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: i * 0.02,
                          type: 'spring',
                          stiffness: 300,
                          damping: 25,
                        }}
                        className="group"
                      >
                        <Link
                          href={`/products/${product.slug}`}
                          onClick={onClose}
                          className="flex h-full cursor-pointer items-center gap-4 rounded-2xl border border-stone-2/30 bg-white/50 p-3 no-underline transition-all hover:bg-white hover:shadow-md hover:border-primary/20"
                        >
                          {/* Thumbnail */}
                          <div
                            className="relative flex-shrink-0 overflow-hidden rounded-xl"
                            style={{ width: 64, height: 64, background: '#F5F3F0' }}
                          >
                            <Image
                              src={product.imageUrl || getSmartFallbackImage(product.name)}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform group-hover:scale-110"
                              sizes="64px"
                              unoptimized
                            />
                            {hasDiscount && (
                              <div
                                className="absolute top-1 left-1 rounded-md px-1 font-heading text-[9px] font-bold text-white shadow-sm"
                                style={{ background: '#E07B39', lineHeight: '14px' }}
                              >
                                -{discountPct}%
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-1 font-heading text-[14px] font-extrabold leading-tight text-ink group-hover:text-primary transition-colors">
                              {product.name}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="font-sans text-[11px] font-semibold text-[#A09890]">
                                {product.soldCount?.toLocaleString('id-ID') ?? 0} terjual
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <p className="font-heading text-[14px] font-extrabold text-primary">
                                {formatPrice(displayPrice)}
                              </p>
                              {hasDiscount && (
                                <p className="font-sans text-[11px] text-[#A09890] line-through">
                                  {formatPrice(product.price)}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                              </svg>
                            </div>
                          </div>
                        </Link>
                      </m.div>
                    );
                  })}
                </div>
              )}
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
