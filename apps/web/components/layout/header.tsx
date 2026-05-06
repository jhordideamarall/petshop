'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { m, AnimatePresence, useScroll, useSpring, useTransform, LayoutGroup } from 'framer-motion';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';
import { useLocationStore } from '@/stores/location-store';
import { CategoryChip } from '@/components/shared/category-chip';
import { SearchModal } from '@/components/shared/search-modal';
import { getCityFromCoords } from '@petshop/core';
import { useQuery } from '@tanstack/react-query';
import { getActiveCategories, type Category } from '@/lib/services/product-client';
import { NotificationSheet } from './notification-sheet';

const PawIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF8235" stroke="none">
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
} as const;

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCat = searchParams.get('category');

  // Fetch real categories
  const { data: dbCategories = [], isLoading: isLoadingCats } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: getActiveCategories,
  });

  const isProductPage = pathname === '/products';
  const [showFilters, setShowFilters] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { coords, locationName, setCoords, setLocationName } = useLocationStore();
  const [isLocating, setIsLocating] = useState(false);
  const items = useCartStore((state) => state.items);
  const cartCount = useMemo(() => items.reduce((total, item) => total + item.quantity, 0), [items]);

  useEffect(() => {
    // Detect Location only if not already detected
    if ('geolocation' in navigator && !coords) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoords([latitude, longitude]);
          const city = await getCityFromCoords(latitude, longitude);
          setLocationName(city);
          setIsLocating(false);
        },
        (error) => {
          // Only log real errors, not permission denials
          if (error.code !== 1) {
            console.error('Geolocation error:', error);
          } else {
            console.warn('Geolocation permission denied by user.');
          }
          setIsLocating(false);
        },
        { timeout: 10000 },
      );
    } else {
      console.warn('Geolocation not supported by this browser.');
    }
  }, []);

  // iOS-native shrink — slow spring, full range
  const { scrollY } = useScroll();
  const smoothY = useSpring(scrollY, { stiffness: 200, damping: 22, restDelta: 0.001, mass: 1.2 });

  const titleRowMb = useTransform(smoothY, [0, 140], [16, 8], { clamp: true });
  const locationOpacity = useTransform(smoothY, [0, 100], [1, 0], { clamp: true });
  const locationHeight = useTransform(smoothY, [0, 140], [16, 0], { clamp: true });
  const searchPy = useTransform(smoothY, [0, 140], [12, 8], { clamp: true });
  const searchMb = useTransform(smoothY, [0, 140], [20, 12], { clamp: true });

  return (
    <>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <NotificationSheet isOpen={notifOpen} onClose={() => setNotifOpen(false)} />

      {/*
        Outer wrapper has NO px-5 so the chip row can span full width.
        Each section that needs horizontal padding applies its own px-5.
      */}
      <m.div
        className="fixed top-0 left-1/2 z-[100] -translate-x-1/2 flex-shrink-0 pb-0"
        animate={{
          boxShadow:
            isProductPage && showFilters
              ? '0 12px 40px rgba(0,0,0,0.12)'
              : '0 10px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
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
        <LayoutGroup>
          {/* ── Title row ── */}
          <m.div
            className="flex items-center justify-between px-[clamp(16px,5vw,20px)]"
            style={{ marginBottom: titleRowMb }}
          >
            <Link href="/" className="flex flex-col no-underline group">
              <m.div 
                layout 
                className="mb-1 flex items-center gap-1.5"
                whileHover="hover"
              >
                <m.div
                  initial={{ rotate: -180, scale: 0, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20,
                    delay: 0.1
                  }}
                  variants={{
                    hover: { 
                      rotate: [0, -15, 15, -15, 0],
                      scale: 1.15,
                      transition: { duration: 0.4, ease: "easeInOut" }
                    }
                  }}
                >
                  <PawIcon />
                </m.div>
                <m.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20,
                    delay: 0.15 
                  }}
                  className="font-heading text-lg font-extrabold tracking-tight text-ink group-hover:text-primary transition-colors"
                >
                  Pawvels
                </m.span>
              </m.div>
              <m.div
                layout
                className="flex items-center gap-1 overflow-hidden"
                style={{ opacity: locationOpacity, height: locationHeight }}
              >
                <span className="flex items-center text-[#A09890]">
                  <MapPin />
                </span>
                <span className="font-sans text-[11px] tracking-wide text-[#A09890]">
                  {isLocating ? 'Mendeteksi...' : locationName}
                </span>
              </m.div>
            </Link>

            <m.div layout className="flex gap-2">
              <m.button 
                whileHover={{ scale: 1.05, background: 'rgba(245,243,240,0.9)' }}
                whileTap={{ scale: 0.94 }} 
                style={iconBtnStyle} 
                aria-label="Notifikasi"
                onClick={() => setNotifOpen(true)}
              >
                <m.div
                  whileHover={{ rotate: [0, -15, 15, -15, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <Bell />
                </m.div>
                <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full border border-white/70 bg-primary" />
              </m.button>
              <Link
                href="/cart"
                className="no-underline"
                aria-label={`Keranjang${cartCount > 0 ? `, ${cartCount} item` : ''}`}
              >
                <m.div
                  whileHover={{ scale: 1.05, background: 'rgba(245,243,240,0.9)' }}
                  whileTap={{ scale: 0.8, rotate: -8 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  style={iconBtnStyle}
                >
                  <m.div
                    key={cartCount}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 15 }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <CartIcon />
                  </m.div>
                  {cartCount > 0 && (
                    <m.div
                      key={`badge-${cartCount}`}
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 8 }}
                      className="badge-bounce absolute -top-1 -right-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full border-2 border-[#FDFCFB] bg-primary px-1 font-heading text-[10px] font-bold text-white shadow-sm"
                    >
                      {cartCount}
                    </m.div>
                  )}
                </m.div>
              </Link>
            </m.div>
          </m.div>

          {/* ── Search + Filter row ── */}
          <m.div
            layout
            className="flex items-center px-[clamp(16px,5vw,20px)]"
            style={{ marginBottom: searchMb }}
          >
            <m.div
              layout
              className="flex-1 min-w-0"
              animate={{ marginRight: isProductPage ? 8 : 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25, mass: 1 }}
            >
              <m.div
                layout
                onClick={() => setSearchOpen(true)}
                animate={{
                  boxShadow: searchOpen
                    ? '0 0 0 2px #E07B39, 0 0 18px rgba(224,123,57,0.5), 0 0 36px rgba(224,123,57,0.22)'
                    : '0 0 0 0px rgba(224,123,57,0)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="flex items-center gap-2.5 rounded-full border border-[#E07B39]/30 bg-stone/60 px-4 cursor-pointer hover:bg-stone/80"
                style={{ paddingTop: searchPy, paddingBottom: searchPy }}
              >
                <m.span layout className="flex items-center text-[#FF8235]">
                  <SearchIcon />
                </m.span>
                <m.span layout className="font-sans text-sm text-[#A09890] truncate">
                  Cari produk untuk peliharaanmu...
                </m.span>
              </m.div>
            </m.div>

            <AnimatePresence mode="popLayout">
              {isProductPage && (
                <m.div
                  layout
                  initial={{ width: 0, opacity: 0, scale: 0.8 }}
                  animate={{ width: 46, opacity: 1, scale: 1 }}
                  exit={{ width: 0, opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 1 }}
                  className="relative flex-shrink-0"
                >
                  <m.button
                    layout
                    whileTap={{ scale: 0.9 }}
                    className={`flex h-[46px] w-[46px] items-center justify-center rounded-full border border-[#FF8235]/30 transition-colors shadow-lg shadow-[#FF8235]/20 ${
                      showFilters ? 'bg-white text-[#FF8235]' : 'bg-[#FF8235] text-white'
                    }`}
                    onClick={() => setShowFilters(!showFilters)}
                    aria-label="Filter"
                  >
                    <m.div
                      layout
                      animate={{ rotate: showFilters ? 180 : 0 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    >
                      <FilterIcon />
                    </m.div>
                  </m.button>
                </m.div>
              )}
            </AnimatePresence>
          </m.div>

          {/*
            ── Category chips ──
          */}
          <AnimatePresence>
            {isProductPage && showFilters && (
              <m.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: 'auto',
                  opacity: 1,
                  transition: {
                    height: { type: 'spring', stiffness: 380, damping: 30 },
                    opacity: { duration: 0.18 },
                  },
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                  transition: {
                    height: { duration: 0.26, ease: [0.4, 0, 0.2, 1] },
                    opacity: { duration: 0.18 },
                  },
                }}
                style={{ overflow: 'hidden' }}
              >
                <m.div
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.04, delayChildren: 0.06 } },
                    exit: { transition: { staggerChildren: 0.025, staggerDirection: -1 } },
                  }}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="flex gap-2.5 overflow-x-auto pb-4 no-scrollbar pl-5 pr-5"
                >
                  <m.div
                    variants={{
                      hidden: { y: 10, opacity: 0, scale: 0.88 },
                      show: {
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        transition: { type: 'spring', stiffness: 300, damping: 22 },
                      },
                      exit: { y: 6, opacity: 0, scale: 0.92, transition: { duration: 0.14 } },
                    }}
                    style={{ flexShrink: 0 }}
                  >
                    <CategoryChip
                      label="Semua"
                      active={!activeCat}
                      onClick={() => router.push('/products')}
                    />
                  </m.div>
                  {isLoadingCats
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <m.div
                          key={i}
                          className="h-8 w-20 animate-pulse rounded-full bg-stone-2 flex-shrink-0"
                        />
                      ))
                    : dbCategories.map((cat: Category) => (
                        <m.div
                          key={cat.id}
                          variants={{
                            hidden: { y: 10, opacity: 0, scale: 0.88 },
                            show: {
                              y: 0,
                              opacity: 1,
                              scale: 1,
                              transition: { type: 'spring', stiffness: 300, damping: 22 },
                            },
                            exit: { y: 6, opacity: 0, scale: 0.92, transition: { duration: 0.14 } },
                          }}
                          style={{ flexShrink: 0 }}
                        >
                          <CategoryChip
                            label={cat.name}
                            active={activeCat === cat.slug}
                            onClick={() => router.push(`/products?category=${cat.slug}`)}
                          />
                        </m.div>
                      ))}
                </m.div>
              </m.div>
            )}
          </AnimatePresence>
        </LayoutGroup>
      </m.div>
    </>
  );
}
