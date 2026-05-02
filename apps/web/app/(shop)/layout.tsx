'use client';
import type { ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { PageTransition } from '@/components/layout/page-transition';
import { AnimatePresence } from 'framer-motion';

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative mx-auto min-h-screen w-full overflow-x-hidden bg-[#FDFCFB]"
      style={{
        maxWidth: 430,
      }}
    >
      {/* Floating Header Overlay */}
      <Header />

      <main
        className="flex min-h-screen flex-col bg-[#F5F3F0]"
        style={{
          paddingTop: 'calc(140px + env(safe-area-inset-top))',
          paddingBottom: 'calc(100px + env(safe-area-inset-bottom))',
        }}
      >
        <AnimatePresence mode="wait">
          <PageTransition key="content">
            {children}
            {/* Footer Removed per UI Mandate */}
          </PageTransition>
        </AnimatePresence>
      </main>

      {/* Floating BottomNav Overlay */}
      <BottomNav />
    </div>
  );
}
