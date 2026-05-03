'use client';

import { useRouter } from 'next/navigation';
import { m } from 'framer-motion';
import { ArrowLeft, Gift, Star, TrendingUp } from 'lucide-react';

interface PointTx {
  id: string;
  label: string;
  points: number;
  date: string;
  type: 'earn' | 'redeem';
}

const TIERS = [
  { name: 'Silver', min: 0, max: 500, color: '#9CA3AF' },
  { name: 'Gold', min: 500, max: 2000, color: '#F4A261' },
  { name: 'Platinum', min: 2000, max: 5000, color: '#6C5CE7' },
];

const CURRENT_POINTS = 1250;

const HISTORY: PointTx[] = [
  { id: '1', label: 'Pembelian Royal Canin', points: 320, date: '28 Apr 2026', type: 'earn' },
  { id: '2', label: 'Pembelian Tali Kekang', points: 185, date: '15 Apr 2026', type: 'earn' },
  { id: '3', label: 'Redeem Voucher 20k', points: -200, date: '10 Apr 2026', type: 'redeem' },
  { id: '4', label: 'Pembelian Vitamin Kucing', points: 145, date: '2 Apr 2026', type: 'earn' },
  { id: '5', label: 'Bonus Ulang Tahun', points: 500, date: '1 Mar 2026', type: 'earn' },
];

const currentTier =
  TIERS.find((t) => CURRENT_POINTS >= t.min && CURRENT_POINTS < t.max) ?? TIERS[1];
const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];
const progress = nextTier
  ? ((CURRENT_POINTS - currentTier.min) / (nextTier.min - currentTier.min)) * 100
  : 100;

export default function LoyaltyPage() {
  const router = useRouter();

  return (
    <div className="bg-[#FDFCFB]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-stone-2 bg-[#FDFCFB]/90 px-5 pb-4 pt-[max(18px,env(safe-area-inset-top))] backdrop-blur-xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-semibold text-ink-3"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>
        <h1 className="mt-3 font-heading text-[22px] font-extrabold text-ink">Loyalty Poin</h1>
      </header>

      <main className="px-5 py-5">
        {/* Hero card */}
        <m.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="relative overflow-hidden rounded-[24px] p-5"
          style={{
            background: `linear-gradient(135deg, #1A1714 0%, #3D2F1E 100%)`,
            boxShadow: '0 12px 32px rgba(26,23,20,0.25)',
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-widest text-white/50">
                Total Poin
              </p>
              <p className="mt-1 font-heading text-[42px] font-extrabold leading-none text-white">
                {CURRENT_POINTS.toLocaleString('id-ID')}
              </p>
              <span
                className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold"
                style={{ background: currentTier.color + '30', color: currentTier.color }}
              >
                <Star size={11} fill={currentTier.color} strokeWidth={0} />
                {currentTier.name} Member
              </span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
              <Gift size={22} className="text-white" />
            </div>
          </div>

          {/* Progress to next tier */}
          {nextTier && (
            <div className="mt-5">
              <div className="flex justify-between text-[11px] font-semibold text-white/60">
                <span>{currentTier.name}</span>
                <span>
                  {nextTier.min - CURRENT_POINTS} poin lagi ke {nextTier.name}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/20">
                <m.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: currentTier.color }}
                />
              </div>
            </div>
          )}
        </m.div>

        {/* Redeem CTA */}
        <m.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          type="button"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[18px] bg-primary py-3.5 font-heading text-[14px] font-extrabold text-white shadow-[0_6px_18px_rgba(224,123,57,0.28)] active:scale-[0.98]"
          style={{ transition: 'transform 0.1s' }}
        >
          <Gift size={16} />
          Tukar Poin
        </m.button>

        {/* History */}
        <div className="mt-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-ink-3" />
            <p className="font-heading text-[15px] font-extrabold text-ink">Riwayat Poin</p>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            {HISTORY.map((tx, i) => (
              <m.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="flex items-center justify-between rounded-[16px] bg-white px-4 py-3 shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
              >
                <div>
                  <p className="text-[14px] font-semibold text-ink">{tx.label}</p>
                  <p className="text-[11px] font-medium text-ink-4">{tx.date}</p>
                </div>
                <span
                  className="font-heading text-[15px] font-extrabold"
                  style={{ color: tx.type === 'earn' ? '#2D7D52' : '#E53935' }}
                >
                  {tx.type === 'earn' ? '+' : ''}
                  {tx.points.toLocaleString('id-ID')}
                </span>
              </m.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
