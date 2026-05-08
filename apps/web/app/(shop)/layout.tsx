'use client';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { DesktopNav } from '@/components/layout/desktop-nav';
import { Footer } from '@/components/layout/footer';

export default function ShopLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isProductDetail, setIsProductDetail] = useState(false);

  useEffect(() => {
    setIsProductDetail(pathname.startsWith('/products/') && pathname !== '/products');
  }, [pathname]);

  return (
    <div className="flex min-h-[100dvh] flex-col">
      {/* Desktop-only elements */}
      <div className="hidden lg:block">
        <DesktopNav />
        <div className="desktop-hero-bg" />
      </div>

      <div className="shop-layout-container relative mx-auto min-h-[100dvh] w-full overflow-x-hidden lg:overflow-visible bg-[#FDFCFB] lg:bg-transparent">
        {/* Header & Banner Background (Grey) - only show on home or list pages. Mobile only. */}
        {!isProductDetail && (
          <div
            className="absolute top-0 left-1/2 w-full -translate-x-1/2 bg-[#F5F3F0] lg:hidden"
            style={{ maxWidth: 430, height: '40vh' }}
          />
        )}

        {/* Floating Header Overlay - Mobile only */}
        {!isProductDetail && (
          <div className="lg:hidden">
            <Header />
          </div>
        )}

        <main
          className="relative z-10 flex min-h-[100dvh] flex-col bg-transparent lg:pb-12"
          style={{
            paddingTop: isProductDetail
              ? 'env(safe-area-inset-top)'
              : 'calc(100px + env(safe-area-inset-top))',
            paddingBottom: isProductDetail
              ? 'calc(80px + env(safe-area-inset-bottom))'
              : 'calc(100px + env(safe-area-inset-bottom))',
          }}
        >
          {/* Desktop spacer */}
          <div className="hidden lg:block h-16" />
          {children}
        </main>

        {/* Floating BottomNav Overlay - Mobile only */}
        {!isProductDetail && (
          <div className="lg:hidden">
            <BottomNav />
          </div>
        )}
      </div>

      {/* Footer - Desktop only */}
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
}
