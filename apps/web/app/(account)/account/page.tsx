'use client';

import Link from 'next/link';
import { m } from 'framer-motion';
import {
  ChevronRight,
  ClipboardList,
  Heart,
  LogOut,
  MapPin,
  PawPrint,
  Settings,
  Star,
} from 'lucide-react';
import type { Route } from 'next';

interface MenuItem {
  href: Route;
  icon: React.ReactNode;
  label: string;
}

const MENU: MenuItem[] = [
  { href: '/account/orders' as Route, icon: <ClipboardList size={17} />, label: 'Pesanan Saya' },
  { href: '/account/pets' as Route, icon: <PawPrint size={17} />, label: 'Hewan Piaraan' },
  { href: '/account/addresses' as Route, icon: <MapPin size={17} />, label: 'Alamat' },
  { href: '/account/loyalty' as Route, icon: <Star size={17} />, label: 'Loyalty Poin' },
  { href: '/account/wishlist' as Route, icon: <Heart size={17} />, label: 'Wishlist' },
];

const CURRENT_POINTS = 1250;
const NEXT_TIER_POINTS = 2000;
const CURRENT_TIER = 'Gold';
const NEXT_TIER = 'Platinum';
const progress = ((CURRENT_POINTS - 500) / (NEXT_TIER_POINTS - 500)) * 100;

export default function AccountPage() {
  return (
    <div className="bg-[#FDFCFB]">
      {/* Hero Banner */}
      <m.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden px-5 pb-6 pt-[max(24px,env(safe-area-inset-top))]"
        style={{
          background: 'linear-gradient(140deg, #1A1714 0%, #3D2F1E 60%, #2A1F0F 100%)',
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          boxShadow: '0 12px 32px rgba(26,23,20,0.22)',
        }}
      >
        {/* Settings */}
        <button
          type="button"
          className="absolute right-5 top-[max(24px,env(safe-area-inset-top))] flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/60 active:scale-90"
          style={{ transition: 'transform 0.1s' }}
        >
          <Settings size={16} />
        </button>

        {/* Profile row */}
        <div>
          <p className="font-heading text-[22px] font-extrabold text-white">Jhordi D.</p>
          <p className="mt-0.5 text-[13px] font-medium text-white/50">0812-3456-7890</p>
        </div>

        {/* Loyalty points */}
        <div className="mt-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                Loyalty Points
              </p>
              <p className="mt-0.5 font-heading text-[36px] font-extrabold leading-none text-white">
                {CURRENT_POINTS.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F4A261]/20 px-3 py-1 text-[12px] font-bold text-[#F4A261]">
                <Star size={10} fill="#F4A261" strokeWidth={0} />
                {CURRENT_TIER}
              </span>
              <p className="text-[11px] font-semibold text-white/40">
                ≈ Rp {(CURRENT_POINTS * 10).toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
              <m.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
                className="h-full rounded-full bg-[#F4A261]"
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] font-semibold text-white/40">
              <span>{CURRENT_TIER}</span>
              <span>
                {NEXT_TIER_POINTS - CURRENT_POINTS} poin lagi ke {NEXT_TIER}
              </span>
            </div>
          </div>
        </div>
      </m.div>

      {/* Menu list */}
      <div className="px-5 pt-5">
        <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
          {MENU.map(({ href, icon, label }, i) => (
            <m.div
              key={href}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.08 + i * 0.04 }}
            >
              <Link
                href={href}
                className="flex items-center gap-3 px-4 py-4 active:bg-stone"
                style={{ transition: 'background 0.12s' }}
              >
                <span className="shrink-0 text-ink-3">{icon}</span>
                <span className="flex-1 font-heading text-[15px] font-bold text-ink">{label}</span>
                <ChevronRight size={15} className="shrink-0 text-ink-4" />
              </Link>
              {i < MENU.length - 1 && <div className="mx-4 h-px bg-stone-2" />}
            </m.div>
          ))}
        </div>

        <p className="mt-5 text-center text-[11px] text-ink-4">Pawvels v1.0</p>
      </div>

      {/* Logout — fixed near bottom nav */}
      <div className="fixed bottom-[calc(88px+env(safe-area-inset-bottom))] left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 px-5">
        <m.button
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-[18px] border border-stone-2 bg-[#FDFCFB]/90 py-3.5 font-heading text-[14px] font-bold text-ink-3 backdrop-blur-md active:scale-[0.98]"
          style={{ transition: 'transform 0.1s' }}
        >
          <LogOut size={15} />
          Keluar
        </m.button>
      </div>
    </div>
  );
}
