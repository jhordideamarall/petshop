'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { m } from 'framer-motion';
import { useCartStore } from '@/stores/cart-store';

const PawIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#E07B39" stroke="none">
    <ellipse cx="7" cy="8" rx="2.5" ry="3" />
    <ellipse cx="17" cy="8" rx="2.5" ry="3" />
    <ellipse cx="4" cy="15" rx="2" ry="2.5" />
    <ellipse cx="20" cy="15" rx="2" ry="2.5" />
    <ellipse cx="12" cy="17" rx="4.5" ry="4" />
  </svg>
);

const MapPin = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const Bell = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const CartIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6" />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const iconBtnStyle = {
  position: 'relative' as const,
  width: 40,
  height: 40,
  borderRadius: 12,
  background: 'rgba(245,243,240,0.6)',
  border: '1px solid rgba(216,212,206,0.4)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#3D3830',
  transition: 'background 0.15s, transform 0.1s',
} as const;

export function Header() {
  const [hydrated, setHydrated] = useState(false);
  const [animTick, setAnimTick] = useState(0);
  const items = useCartStore((state) => state.items);
  const cartCount = useMemo(() => items.reduce((total, item) => total + item.quantity, 0), [items]);

  useEffect(() => {
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (cartCount > 0 && hydrated) {
      setAnimTick((prev) => prev + 1);
    }
  }, [cartCount, hydrated]);

  return (
    <div
      className="absolute top-0 left-0 right-0 z-[100] flex-shrink-0 border-b border-white/20 px-5 pb-0"
      style={{
        paddingTop: 'calc(12px + env(safe-area-inset-top))',
        background: 'rgba(253,252,251,0.82)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <Link href="/" className="flex flex-col no-underline">
          <div className="mb-1 flex items-center gap-1.5">
            <PawIcon />
            <span className="font-heading text-lg font-extrabold tracking-tight text-ink">
              Pawvels
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="flex items-center text-[#A09890]">
              <MapPin />
            </span>
            <span className="font-sans text-[11px] tracking-wide text-[#A09890]">
              Jakarta Selatan
            </span>
          </div>
        </Link>
        <div className="flex gap-2">
          <m.button whileTap={{ scale: 0.94 }} style={iconBtnStyle} aria-label="Notifikasi">
            <Bell />
            <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full border border-white/70 bg-primary" />
          </m.button>
          <Link
            href="/cart"
            className="no-underline"
            aria-label={`Keranjang${hydrated && cartCount > 0 ? `, ${cartCount} item` : ''}`}
          >
            <m.div whileTap={{ scale: 0.94 }} style={iconBtnStyle}>
              <m.div
                key={`icon-${animTick}`}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 600, damping: 15 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <CartIcon />
              </m.div>
              {hydrated && cartCount > 0 && (
                <m.div
                  key={`badge-${animTick}`}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 700, damping: 12 }}
                  className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full border-2 border-[#FDFCFB] bg-primary px-1 font-heading text-[10px] font-bold text-white shadow-sm"
                >
                  {cartCount}
                </m.div>
              )}
            </m.div>
          </Link>
        </div>
      </div>

      {/* Search bar */}
      <m.div whileTap={{ scale: 0.98 }}>
        <Link
          href="/search"
          className="mb-5 flex cursor-pointer items-center gap-2.5 rounded-full border border-[#E07B39]/30 bg-stone/60 px-4 py-3 no-underline transition-colors hover:bg-stone/80"
        >
          <span className="flex items-center text-[#E07B39]">
            <SearchIcon />
          </span>
          <span className="font-sans text-sm text-[#A09890]">
            Cari produk untuk peliharaanmu...
          </span>
        </Link>
      </m.div>
    </div>
  );
}
