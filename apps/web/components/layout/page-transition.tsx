'use client';
import { m } from 'framer-motion';

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100%' }}
    >
      {children}
    </m.div>
  );
}
