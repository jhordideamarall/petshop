'use client';
import { useRef, type CSSProperties, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  m,
  useScroll,
  useMotionValue,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from 'framer-motion';
import { BestOffersGrid } from '@/components/home/best-offers';
import { DesktopBannerSlider } from '@/components/home/desktop-banner-slider';
import { ProductCard, type ProductCardData } from '@/components/shared/product-card';
import { useCartStore } from '@/stores/cart-store';
import { useQuery } from '@tanstack/react-query';
import {
  getActiveProducts,
  getActiveCategories,
  type ProductWithDetails,
  type Category,
} from '@/lib/services/product-client';
import { Loader2 } from 'lucide-react';

const BANNERS = [
  {
    id: 1,
    tag: 'Flash Sale',
    title: 'Diskon hingga 50%',
    desc: 'Makanan & aksesoris premium pilihan',
    cta: 'Belanja sekarang',
    link: '/products?sale=true',
    bg: 'linear-gradient(135deg, #1A1714 0%, #3D2F1E 100%)',
    accent: '#FF8235',
  },
  {
    id: 2,
    tag: 'New Arrivals',
    title: 'Koleksi Mainan Baru',
    desc: 'Bikin peliharaanmu makin aktif & ceria',
    cta: 'Lihat koleksi',
    link: '/products?category=aksesoris',
    bg: 'linear-gradient(135deg, #2D1E1A 0%, #4A2B24 100%)',
    accent: '#F5A46A',
  },
  {
    id: 3,
    tag: 'Pet Care',
    title: 'Grooming Professional',
    desc: 'Perawatan terbaik untuk anjing & kucingmu',
    cta: 'Booking Slot',
    link: '/booking',
    bg: 'linear-gradient(135deg, #1E2D24 0%, #244A35 100%)',
    accent: '#4CAF50',
  },
  {
    id: 4,
    tag: 'Loyalty Program',
    title: 'Double Poin Weekend',
    desc: 'Kumpulkan poin & tukar dengan voucher',
    cta: 'Cek Poin',
    link: '/account/loyalty',
    bg: 'linear-gradient(135deg, #2D1E3D 0%, #4A246B 100%)',
    accent: '#9C27B0',
  },
];

const ScissorsIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#FF8235"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

const ChevronRight = () => (
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
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const FEATURES = [
  { label: 'Same day', sub: 'Order Before 14:00' },
  { label: 'Produk original', sub: 'Bergaransi resmi' },
  { label: 'Poin loyalty', sub: 'Setiap pembelian' },
] as const;

interface BannerCardProps {
  banner: (typeof BANNERS)[0];
  index: number;
  scrollXProgress: MotionValue<number>;
  count: number;
}

function BannerCard({ banner, index, scrollXProgress, count }: BannerCardProps) {
  const step = count > 1 ? 1 / (count - 1) : 1;
  const centerPoint = index * step;

  const x = useTransform(scrollXProgress, (v) => {
    const dist = (v - centerPoint) / step;
    return dist <= -1 ? 135 : dist >= 1 ? -135 : -dist * 135;
  });

  const scale = useTransform(scrollXProgress, (v) => {
    const dist = Math.abs(v - centerPoint) / step;
    return dist >= 1 ? 0.88 : 1 - dist * 0.12;
  });

  const rotateY = useTransform(scrollXProgress, (v) => {
    const dist = (v - centerPoint) / step;
    return dist <= -1 ? 25 : dist >= 1 ? -25 : -dist * 25;
  });

  const opacity = useTransform(scrollXProgress, (v) => {
    const dist = Math.abs(v - centerPoint) / step;
    return dist >= 1 ? 0.98 : 1 - dist * 0.02;
  });

  const zIndex = useMotionValue(Math.round(100 - index * step * 10));

  useMotionValueEvent(scrollXProgress, 'change', (latest) => {
    const distance = Math.abs(latest - centerPoint);
    const unCappedDistance = distance / step;
    zIndex.set(Math.round(100 - unCappedDistance * 10));
  });

  return (
    <m.div
      className="banner-card"
      style={{
        position: 'absolute',
        width: '100%',
        height: 'clamp(180px, 48vw, 210px)',
        borderRadius: 24,
        background: banner.bg,
        padding: '28px 24px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        scale,
        x,
        rotateY,
        opacity,
        zIndex,
        boxShadow: '0 15px 45px rgba(0,0,0,0.25)',
      }}
    >
      <div className="absolute inset-0 z-0 opacity-40">
        <Image
          src={`https://images.unsplash.com/photo-${banner.id === 1 ? '1583337130417-3346a1be7dee' : banner.id === 2 ? '1548546738-8509cb246ed3' : '1585110396000-c9ffd4e4b308'}?w=800&q=80`}
          alt=""
          fill
          priority={index === 0}
          className="object-cover"
          sizes="(max-width: 430px) 100vw, 430px"
        />
        <div
          className="absolute inset-0"
          style={{ background: banner.bg, mixBlendMode: 'multiply' }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          right: -12,
          top: -12,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: banner.accent,
          opacity: 0.12,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 20,
          bottom: -20,
          width: 90,
          height: 90,
          borderRadius: '50%',
          background: banner.accent,
          opacity: 0.08,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 10px',
            borderRadius: 9999,
            background: 'rgba(255,255,255,0.15)',
            color: 'white',
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: '0.2px',
            marginBottom: 10,
          }}
        >
          {banner.tag}
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 24,
            color: 'white',
            lineHeight: 1.15,
            letterSpacing: '-0.5px',
            marginBottom: 6,
          }}
        >
          {banner.title}
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            color: 'rgba(255,255,255,0.85)',
            marginBottom: 16,
          }}
        >
          {banner.desc}
        </p>
        <div
          style={{
            pointerEvents: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            padding: '9px 18px',
            borderRadius: 9999,
            background: 'white',
            color: '#1A1714',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 13,
            textDecoration: 'none',
          }}
        >
          {banner.cta}
        </div>
      </div>
    </m.div>
  );
}

export default function HomePage() {
  const addItem = useCartStore((state) => state.addItem);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize scroll listener — useScroll is client-side only
  const { scrollXProgress } = useScroll({
    container: scrollRef,
  });

  // Fetch real products
  const { data: products = [], isLoading } = useQuery<ProductWithDetails[]>({
    queryKey: ['products'],
    queryFn: getActiveProducts,
  });

  // Fetch real categories
  const { data: dbCategories = [], isLoading: isLoadingCats } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => getActiveCategories(),
  });

  const bestOffers = useMemo(() => products.filter((p) => (p.promoPrice ?? 0) > 0), [products]);

  const handleAddToCart = (product: ProductWithDetails) => {
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
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        position: 'relative',
      }}
    >
      {/* Background fill for Header area to prevent color jump */}
      <div
        className="lg:hidden"
        style={{
          position: 'absolute',
          top: -200,
          left: 0,
          right: 0,
          height: 200,
          background: '#F5F3F0',
          zIndex: 0,
        }}
      />

      {/* Top Section (Grey Background) - Banner & Same Day */}
      <div
        style={{ paddingBottom: 48 }}
        className="bg-[#F5F3F0] lg:bg-transparent lg:rounded-3xl lg:mx-6 lg:pb-6"
      >
        {/* Desktop simple slider */}
        <DesktopBannerSlider banners={BANNERS} />

        {/* Hero Carousel — mobile only */}
        <div
          className="banner-container lg:mx-auto lg:max-w-[1100px] lg:mt-8"
          style={{
            position: 'relative',
            marginTop: 40,
            height: 'clamp(210px, 55vw, 240px)',
            width: '100%',
            overflow: 'hidden',
            padding: '0 clamp(16px, 5vw, 20px)',
          }}
        >
          <div
            style={{
              position: 'relative',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              perspective: '1200px',
            }}
          >
            {BANNERS.map((banner, i) => (
              <BannerCard
                key={banner.id}
                banner={banner}
                index={i}
                scrollXProgress={scrollXProgress}
                count={BANNERS.length}
              />
            ))}
          </div>
          <div
            ref={scrollRef}
            style={{
              position: 'absolute',
              inset: '0 16px',
              overflowX: 'scroll',
              overflowY: 'hidden',
              display: 'flex',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              zIndex: 200,
              opacity: 0,
            }}
          >
            {BANNERS.map((_, i) => (
              <div
                key={i}
                style={{
                  minWidth: '100%',
                  height: '100%',
                  scrollSnapAlign: 'center',
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        </div>

        {/* Feature strip */}
        <div
          className="mx-[clamp(16px,5vw,20px)] mt-4 lg:mx-auto lg:mt-16 lg:max-w-[1052px]"
          style={{
            background: '#FDFCFB',
            borderRadius: 16,
            boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
            border: '1px solid rgba(224, 123, 57, 0.3)',
            display: 'grid',
            gridTemplateColumns: '1fr 1px 1fr 1px 1fr',
          }}
        >
          {FEATURES.map((feat, i) => (
            <div key={feat.label} style={{ display: 'contents' }}>
              <div style={{ padding: '14px 12px', textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: 14,
                    color: '#1A1714',
                    marginBottom: 2,
                  }}
                >
                  {feat.label}
                </div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#6B6460' }}>
                  {feat.sub}
                </div>
              </div>
              {i < 2 && <div style={{ background: 'rgba(224, 123, 57, 0.3)', width: 1 }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area (White Background with Rounded Top) */}
      <div
        className="desktop-content lg:mx-auto lg:max-w-[1052px] lg:rounded-none lg:mt-0"
        style={{
          background: '#FDFCFB',
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          paddingTop: 16,
          paddingBottom: 24,
          marginTop: -32,
          position: 'relative',
          zIndex: 2,
          minHeight: '100vh',
        }}
      >
        <div className="lg:bg-white lg:rounded-[32px] lg:p-8 lg:mb-10 lg:shadow-[0_8px_30px_rgba(0,0,0,0.04)] lg:border lg:border-stone-2">
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '20px clamp(16px, 5vw, 20px) 12px',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: 16,
                  color: '#1A1714',
                }}
              >
                Kategori
              </span>
              <Link
                href="/products"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 600,
                  fontSize: 13,
                  color: '#FF8235',
                  textDecoration: 'none',
                }}
              >
                Lihat semua
              </Link>
            </div>
            <div
              className="flex gap-2 overflow-x-auto px-4 pb-1 lg:flex-wrap lg:overflow-x-visible"
              style={
                {
                  scrollbarWidth: 'none',
                  WebkitOverflowScrolling: 'touch',
                } as CSSProperties
              }
            >
              {isLoadingCats
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-9 w-24 animate-pulse rounded-full bg-stone-2 flex-shrink-0"
                    />
                  ))
                : dbCategories.map((cat: Category) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.slug}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '8px 16px',
                        borderRadius: 9999,
                        border: '1.5px solid rgba(224, 123, 57, 0.3)',
                        background: '#FDFCFB',
                        color: '#1A1714',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 600,
                        fontSize: 13,
                        whiteSpace: 'nowrap',
                        textDecoration: 'none',
                        flexShrink: 0,
                      }}
                    >
                      {cat.name}
                    </Link>
                  ))}
            </div>
          </div>

          <div
            style={{
              margin: '32px clamp(16px, 5vw, 20px) 8px',
              background: '#FDFCFB',
              borderRadius: 16,
              border: '1px solid rgba(224, 123, 57, 0.3)',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#FDF0E7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ScissorsIcon />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: 14,
                  color: '#1A1714',
                  marginBottom: 2,
                }}
              >
                Grooming & Pet Hotel
              </div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#6B6460' }}>
                Booking jadwal sekarang, slot terbatas
              </div>
            </div>
            <Link
              href="/booking"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '8px 14px',
                borderRadius: 9999,
                border: '1.5px solid rgba(224, 123, 57, 0.3)',
                background: '#FDFCFB',
                boxShadow: '0 4px 14px rgba(224, 123, 57, 0.35)',
                color: '#1A1714',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: 13,
                textDecoration: 'none',
                flexShrink: 0,
              }}
            >
              Booking <ChevronRight />
            </Link>
          </div>
        </div>

        <div style={{ marginBottom: 8, marginTop: 32 }} className="lg:mt-16">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '20px clamp(16px, 5vw, 20px) 12px',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: 16,
                  color: '#1A1714',
                }}
              >
                Penawaran Terbaik
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: '#6B6460' }}>
                  Berakhir dalam
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: 13,
                    color: '#FF8235',
                  }}
                >
                  02:14:38
                </span>
              </div>
            </div>
            <Link
              href={'/products?sale=true'}
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: 13,
                color: '#FF8235',
                textDecoration: 'none',
              }}
            >
              Lihat semua
            </Link>
          </div>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : (
            <BestOffersGrid products={bestOffers.slice(0, 2) as unknown as ProductCardData[]} />
          )}
        </div>

        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '20px clamp(16px, 5vw, 20px) 12px',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 16,
                color: '#1A1714',
              }}
            >
              Semua Produk
            </span>
            <Link
              href={'/products'}
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: 13,
                color: '#FF8235',
                textDecoration: 'none',
              }}
            >
              Lainnya
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 px-[clamp(16px,5vw,20px)] lg:grid-cols-3 xl:grid-cols-4 lg:gap-5">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-stone-2" />
              ))
            ) : products.length > 0 ? (
              products.map((p, index) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={handleAddToCart as unknown as (product: ProductCardData) => void}
                  priority={index < 4}
                />
              ))
            ) : (
              <div className="col-span-2 py-10 text-center text-sm font-medium text-ink-4">
                Belum ada produk tersedia.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
