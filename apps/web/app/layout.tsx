import type { Metadata } from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { Inter, Outfit } from 'next/font/google';
import { cn } from '@petshop/ui/utils';
import { Providers } from '@/components/providers/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-heading' });

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#FDFCFB',
  interactiveWidget: 'resizes-visual',
};

export const metadata: Metadata = {
  title: {
    default: 'Pawvels',
    template: '%s | Pawvels',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon-pawvels.png',
  },
  description: 'Petshop terlengkap di Jakarta. Produk, grooming, dan hotel hewan piaraan.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Pawvels',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'Pawvels',
    url: 'https://pawvels.com',
    title: 'Pawvels — Petshop Jakarta',
    description: 'Petshop terlengkap di Jakarta. Produk, grooming, dan hotel hewan piaraan.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={cn('font-sans antialiased', inter.variable, outfit.variable)}>
      <body style={{ background: 'var(--color-app-bg)' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
