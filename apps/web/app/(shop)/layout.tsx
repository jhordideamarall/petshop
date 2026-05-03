'use client';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';

export default function ShopLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Product detail pages match /products/[slug] but NOT exactly /products
  const isProductDetail = pathname.startsWith('/products/') && pathname !== '/products';

  return (
    <div
      className="relative mx-auto min-h-screen w-full overflow-x-hidden bg-[#FDFCFB]"
      style={{
        maxWidth: 430,
      }}
    >
      {/* Header & Banner Background (Grey) - only show on home or list pages */}
      {!isProductDetail && (
        <div
          className="absolute top-0 left-1/2 w-full -translate-x-1/2 bg-[#F5F3F0]"
          style={{ maxWidth: 430, height: '40vh' }}
        />
      )}

      {/* Floating Header Overlay */}
      {!isProductDetail && <Header />}

      <main
        className="relative z-10 flex min-h-screen flex-col bg-transparent"
        style={{
          paddingTop: isProductDetail
            ? 'env(safe-area-inset-top)'
            : 'calc(100px + env(safe-area-inset-top))',
          paddingBottom: isProductDetail
            ? 'calc(80px + env(safe-area-inset-bottom))'
            : 'calc(100px + env(safe-area-inset-bottom))',
        }}
      >
        {children}
      </main>

      {/* Floating BottomNav Overlay */}
      {!isProductDetail && <BottomNav />}
    </div>
  );
}
