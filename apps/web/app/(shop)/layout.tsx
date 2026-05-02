'use client';
import type { ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { PageTransition } from '@/components/layout/page-transition';
import { AnimatePresence } from 'framer-motion';

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#FDFCFB',
        overflow: 'hidden',
        maxWidth: 430,
        margin: '0 auto',
      }}
    >
      {/* Floating Header Overlay */}
      <Header />

      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          overscrollBehavior: 'contain',
          background: '#F5F3F0',
          paddingTop: 140, // Space for floating header
          paddingBottom: 90, // Space for floating bottom nav
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
