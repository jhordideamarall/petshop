'use client';
import type { ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative mx-auto min-h-screen w-full overflow-x-hidden bg-[#FDFCFB]"
      style={{
        maxWidth: 430,
      }}
    >
      {/* Header & Banner Background (Grey) */}
      <div
        className="absolute top-0 left-1/2 w-full -translate-x-1/2 bg-[#F5F3F0]"
        style={{ maxWidth: 430, height: '40vh' }}
      />

      {/* Floating Header Overlay */}
      <Header />

      <main
        className="relative z-10 flex min-h-screen flex-col bg-transparent"
        style={{
          paddingTop: 'calc(100px + env(safe-area-inset-top))',
          paddingBottom: 'calc(100px + env(safe-area-inset-bottom))',
        }}
      >
        {children}
        {/* Footer Removed per UI Mandate */}
      </main>

      {/* Floating BottomNav Overlay */}
      <BottomNav />
    </div>
  );
}
