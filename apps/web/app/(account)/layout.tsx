'use client';
import type { ReactNode } from 'react';
import { BottomNav } from '@/components/layout/bottom-nav';

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative mx-auto min-h-screen w-full overflow-x-hidden bg-[#FDFCFB]"
      style={{ maxWidth: 430 }}
    >
      <main
        className="relative flex min-h-screen flex-col"
        style={{ paddingBottom: 'calc(90px + env(safe-area-inset-bottom))' }}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
