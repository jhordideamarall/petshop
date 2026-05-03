'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { m, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';
import { CategoryChip } from '@/components/shared/category-chip';

const CATEGORIES = ['Makanan', 'Aksesoris', 'Obat & Vitamin', 'Kandang', 'Grooming', 'Mainan'];

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

const FilterIcon = () => (
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
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="2" y1="14" x2="6" y2="14" />
    <line x1="10" y1="8" x2="14" y2="8" />
    <line x1="18" y1="16" x2="22" y2="16" />
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
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCat = searchParams.get('category');

  const isProductPage = pathname === '/products';
  const [showFilters, setShowFilters] = useState(false);
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

  // iOS-native shrink-on-scroll behavior
  const { scrollY } = useScroll();
  const titleRowMb = useTransform(scrollY, [0, 60], [16, 8], { clamp: true });
  const locationOpacity = useTransform(scrollY, [0, 30], [1, 0], { clamp: true });
  const locationHeight = useTransform(scrollY, [0, 60], [16, 0], { clamp: true });
  const searchPy = useTransform(scrollY, [0, 60], [12, 8], { clamp: true });
  const searchMb = useTransform(scrollY, [0, 60], [20, 12], { clamp: true });

  return (
    <m.div
      className="fixed top-0 left-1/2 z-[100] -translate-x-1/2 flex-shrink-0 px-5 pb-0"
      animate={{
        boxShadow:
          isProductPage && showFilters
            ? '0 12px 40px rgba(0,0,0,0.12)'
            : '0 10px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)', // Shadow super tebal
      }}
      style={{
        width: '100%',
        maxWidth: 430,
        paddingTop: 'calc(12px + env(safe-area-inset-top))',
        background: 'rgba(245,243,240,0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
      }}
    >
      <m.div className="flex items-center justify-between" style={{ marginBottom: titleRowMb }}>
        <Link href="/" className="flex flex-col no-underline">
          <div className="mb-1 flex items-center gap-1.5">
            <PawIcon />
            <span className="font-heading text-lg font-extrabold tracking-tight text-ink">
              Pawvels
            </span>
          </div>
          <m.div
            className="flex items-center gap-1 overflow-hidden"
            style={{ opacity: locationOpacity, height: locationHeight }}
          >
            <span className="flex items-center text-[#A09890]">
              <MapPin />
            </span>
            <span className="font-sans text-[11px] tracking-wide text-[#A09890]">
              Jakarta Selatan
            </span>
          </m.div>
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
      </m.div>

      {/* Search bar & Filter */}
      <m.div className="flex items-center" style={{ marginBottom: searchMb }}>
        <m.div
          className="flex-1"
          animate={{ marginRight: isProductPage ? 8 : 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          <Link href="/search" className="block no-underline cursor-pointer">
            <m.div
              className="flex items-center gap-2.5 rounded-full border border-[#E07B39]/30 bg-stone/60 px-4 transition-colors hover:bg-stone/80"
              style={{ paddingTop: searchPy, paddingBottom: searchPy }}
            >
              <span className="flex items-center text-[#E07B39]">
                <SearchIcon />
              </span>
              <span className="font-sans text-sm text-[#A09890]">
                Cari produk untuk peliharaanmu...
              </span>
            </m.div>
          </Link>
        </m.div>

        <m.div
          animate={{
            width: isProductPage ? 46 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 20,
          }}
          className="relative"
        >
          <m.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: isProductPage ? 1 : 0,
              opacity: isProductPage ? 1 : 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
              delay: isProductPage ? 0.35 : 0,
            }}
            whileTap={{ scale: 0.9 }}
            className={`flex h-[46px] w-[46px] items-center justify-center rounded-full border border-[#E07B39]/30 transition-colors shadow-lg shadow-[#E07B39]/20 flex-shrink-0 ${
              showFilters ? 'bg-white text-[#E07B39]' : 'bg-[#E07B39] text-white'
            }`}
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Filter"
          >
            <m.div
              animate={{ rotate: showFilters ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              <FilterIcon />
            </m.div>
          </m.button>
        </m.div>
      </m.div>

      <AnimatePresence>
        {isProductPage && showFilters && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
              transition: {
                height: { type: 'spring', stiffness: 400, damping: 28 },
                opacity: { duration: 0.2 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.2 },
              },
            }}
            className="overflow-hidden"
          >
            <m.div
              variants={{
                show: {
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.1,
                  },
                },
              }}
              initial="hidden"
              animate="show"
              className="flex gap-2.5 overflow-x-auto pb-4 no-scrollbar"
            >
              <m.div
                variants={{
                  hidden: { y: 10, opacity: 0 },
                  show: {
                    y: 0,
                    opacity: 1,
                    transition: { type: 'spring', stiffness: 300, damping: 25 },
                  },
                }}
              >
                <CategoryChip
                  label="Semua"
                  active={!activeCat}
                  onClick={() => router.push('/products')}
                />
              </m.div>
              {CATEGORIES.map((cat) => (
                <m.div
                  key={cat}
                  variants={{
                    hidden: { y: 10, opacity: 0 },
                    show: {
                      y: 0,
                      opacity: 1,
                      transition: { type: 'spring', stiffness: 300, damping: 25 },
                    },
                  }}
                >
                  <CategoryChip
                    label={cat}
                    active={activeCat === cat.toLowerCase()}
                    onClick={() => router.push(`/products?category=${cat.toLowerCase()}`)}
                  />
                </m.div>
              ))}
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
}
