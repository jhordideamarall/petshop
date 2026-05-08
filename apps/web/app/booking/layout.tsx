'use client';
import type { ReactNode } from 'react';
import { Footer } from '@/components/layout/footer';

export default function BookingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <div className="flex-1">{children}</div>
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
}
