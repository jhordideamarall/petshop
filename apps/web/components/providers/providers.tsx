'use client';
import { Toaster } from 'sonner';
import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig transition={{ type: 'spring', stiffness: 380, damping: 30 }}>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </MotionConfig>
    </LazyMotion>
  );
}
