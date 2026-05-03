'use client';
import type { ComponentType } from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? '#E07B39' : '#A09890'}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
);

const ShopIcon = ({ active }: { active: boolean }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? '#E07B39' : '#A09890'}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

const BookingIcon = ({ active }: { active: boolean }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? '#E07B39' : '#A09890'}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

const UserIcon = ({ active }: { active: boolean }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? '#E07B39' : '#A09890'}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

interface Tab {
  href: Route;
  label: string;
  icon: ComponentType<{ active: boolean }>;
  match: (pathname: string) => boolean;
}

const tabs: Tab[] = [
  {
    href: '/',
    label: 'Home',
    icon: HomeIcon,
    match: (p) => p === '/',
  },
  {
    href: '/products' as Route,
    label: 'Produk',
    icon: ShopIcon,
    match: (p) =>
      p.startsWith('/products') || p.startsWith('/categories') || p.startsWith('/search'),
  },
  {
    href: '/booking' as Route,
    label: 'Booking',
    icon: BookingIcon,
    match: (p) => p.startsWith('/booking'),
  },
  {
    href: '/account' as Route,
    label: 'Akun',
    icon: UserIcon,
    match: (p) => p.startsWith('/account'),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-[100] flex -translate-x-1/2 flex-shrink-0 border-t border-white/20 pb-[max(12px,env(safe-area-inset-bottom))] pt-2"
      style={{
        width: '100%',
        maxWidth: 430,
        background: 'rgba(253,252,251,0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        boxShadow: '0 -8px 30px rgba(0,0,0,0.08), 0 -2px 8px rgba(0,0,0,0.04)',
        boxSizing: 'border-box',
      }}
      aria-label="Navigasi utama"
    >
      {tabs.map(({ href, label, icon: IconComp, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className="flex flex-1 flex-col items-center gap-1 py-1 no-underline"
          >
            <IconComp active={active} />
            <span
              className="font-heading text-[10px] font-semibold tracking-wide"
              style={{
                color: active ? '#E07B39' : '#A09890',
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
