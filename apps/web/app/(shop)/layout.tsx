'use client';
import type { ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Footer } from '@/components/layout/footer';
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
      <Header />
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          overscrollBehavior: 'contain',
          background: '#F5F3F0',
        }}
      >
        <AnimatePresence mode="wait">
          <PageTransition key="content">
            {children}
            <Footer />
          </PageTransition>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}
