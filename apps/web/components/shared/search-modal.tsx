'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { getProducts } from '@/lib/dummy-products';

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

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen]);

  const results = useMemo(() => {
    const products = getProducts();

    if (!query.trim()) {
      return products.filter((p) => p.promoPrice != null);
    }
    const q = query.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [query]);

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
            initial={{ opacity: 0, scale: 0.94, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -12 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="fixed z-[110] left-1/2 -translate-x-1/2"
            style={{
              top: 'calc(85px + env(safe-area-inset-top))',
              width: 'calc(min(100vw, 430px) - 32px)',
              maxWidth: 398,
              background: 'rgba(253,252,251,0.97)',
              borderRadius: 20,
              boxShadow: '0 24px 60px rgba(0,0,0,0.18), 0 8px 20px rgba(0,0,0,0.10)',
              overflow: 'hidden',
            }}
          >
            {/* Search input row */}
            <div
              className="flex items-center gap-3 px-4"
              style={{
                paddingTop: 14,
                paddingBottom: 14,
                borderBottom: '1px solid rgba(216,212,206,0.5)',
              }}
            >
              <SearchInputIcon />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari produk untuk peliharaanmu..."
                className="flex-1 bg-transparent font-sans text-sm text-ink outline-none placeholder:text-[#A09890]"
                style={{ fontSize: 14 }}
              />
              <m.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 28,
                  height: 28,
                  background: 'rgba(216,212,206,0.45)',
                  color: '#7A746E',
                  flexShrink: 0,
                }}
                aria-label="Tutup pencarian"
              >
                <CloseIcon />
              </m.button>
            </div>

            {/* Section label */}
            <div className="px-4 pt-3 pb-2">
              <span className="font-heading text-[11px] font-bold tracking-widest uppercase text-[#A09890]">
                {query.trim() ? 'Hasil Pencarian' : 'Diskon Spesial'}
              </span>
            </div>

            {/* Product list */}
            <div className="overflow-y-auto" style={{ maxHeight: 340, paddingBottom: 8 }}>
              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-[#A09890]">
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <p className="mt-3 font-sans text-sm">Produk tidak ditemukan</p>
                </div>
              ) : (
                results.map((product, i) => {
                  const displayPrice = product.promoPrice ?? product.price;
                  const hasDiscount = product.promoPrice != null;
                  const discountPct = hasDiscount
                    ? Math.round(((product.price - product.promoPrice!) / product.price) * 100)
                    : 0;

                  return (
                    <m.div
                      key={product.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.035, type: 'spring', stiffness: 300, damping: 25 }}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                      style={{
                        borderBottom:
                          i < results.length - 1 ? '1px solid rgba(216,212,206,0.3)' : 'none',
                      }}
                      whileTap={{ backgroundColor: 'rgba(224,123,57,0.06)' }}
                      onClick={onClose}
                    >
                      {/* Thumbnail */}
                      <div
                        className="relative flex-shrink-0 overflow-hidden rounded-xl"
                        style={{ width: 52, height: 52, background: '#F5F3F0' }}
                      >
                        <Image
                          src={product.imageUrl ?? ''}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="52px"
                          unoptimized
                        />
                        {hasDiscount && (
                          <div
                            className="absolute top-1 left-1 rounded-md px-1 font-heading text-[9px] font-bold text-white"
                            style={{ background: '#E07B39', lineHeight: '14px' }}
                          >
                            -{discountPct}%
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm font-medium text-ink truncate leading-tight">
                          {product.name}
                        </p>
                        <p className="mt-0.5 font-sans text-[11px] text-[#A09890]">
                          {product.category}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="flex-shrink-0 text-right">
                        <p className="font-heading text-sm font-bold" style={{ color: '#E07B39' }}>
                          {formatPrice(displayPrice)}
                        </p>
                        {hasDiscount && (
                          <p className="font-sans text-[11px] text-[#A09890] line-through">
                            {formatPrice(product.price)}
                          </p>
                        )}
                      </div>
                    </m.div>
                  );
                })
              )}
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
